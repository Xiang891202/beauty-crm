import prisma from '../config/prisma';
import { ServiceLogRepository } from '../repositories/service_log.repo';
import { ServiceLog } from '../types';
import { InsufficientQuotaError } from '../types/errors';
import { supabase } from '../lib/supabase';

export class ServiceLogService {
  private repo: ServiceLogRepository;

  constructor() {
    this.repo = new ServiceLogRepository();
  }

  async create(data: Omit<ServiceLog, 'id' | 'created_at'>, tenantId?: number): Promise<ServiceLog> {
    if (!data.member_service_id) {
      return this.repo.create(data, tenantId);
    }

    const memberService = await prisma.memberService.findUnique({
      where: { id: data.member_service_id },
      select: { remaining_sessions: true }
    });
    if (!memberService) throw new Error('找不到該服務授權');
    if (memberService.remaining_sessions <= 0) throw new InsufficientQuotaError();

    const result = await prisma.$transaction(async (tx) => {
      const createData: any = {
        customer_id: data.customer_id!,
        member_service_id: data.member_service_id!,
        service_id: data.service_id ?? undefined,
        used_at: data.used_at ?? undefined,
        notes: data.notes ?? undefined,
        signature_url: data.signature_url ?? undefined,
        created_by: data.created_by!,
      };
      if (tenantId) createData.tenant_id = tenantId;

      const newLog = await tx.serviceLog.create({ data: createData });

      await tx.memberService.update({
        where: { id: data.member_service_id! },
        data: { remaining_sessions: { decrement: 1 } }
      });

      return newLog;
    });

    return result;
  }

  async getById(id: number, tenantId?: number): Promise<ServiceLog> {
    const record = await this.repo.findById(id, tenantId);
    if (!record) throw new Error('Service log not found');
    return record;
  }

  async updateNotes(id: number, notes: string, tenantId?: number): Promise<ServiceLog> {
    return this.repo.update(id, { notes }, tenantId);
  }

  async updateSignature(id: number, signatureUrl: string, tenantId?: number): Promise<ServiceLog> {
    return this.repo.update(id, { signature_url: signatureUrl }, tenantId);
  }

  async getUnifiedList(params: {
    customer_id?: number;
    customer_name?: string;
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
    tenantId?: number;
  }) {
    const { customer_id, customer_name, startDate, endDate, page, limit, tenantId } = params;
    const offset = (page - 1) * limit;

    // 1. 传统服务日志 (Prisma) —— 加上租户过滤
    const traditionalWhere: any = {};
    if (tenantId) traditionalWhere.tenant_id = tenantId;
    if (customer_id) traditionalWhere.customer_id = customer_id;
    if (startDate) traditionalWhere.used_at = { gte: startDate };
    if (endDate) traditionalWhere.used_at = { lte: endDate };

    const traditionalLogs = await prisma.serviceLog.findMany({
      where: traditionalWhere,
      include: {
        service: { select: { id: true, name: true } },
        member_service: { select: { id: true, total_sessions: true, remaining_sessions: true } },
        customer: { select: { id: true, name: true } }
      },
      orderBy: { used_at: 'desc' },
      skip: offset,
      take: limit,
    });
    const traditionalCount = await prisma.serviceLog.count({ where: traditionalWhere });

    const traditionalItems = traditionalLogs.map(log => ({
      id: `trad_${log.id}`,
      type: 'traditional',
      occurred_at: log.used_at,
      customer_name: log.customer?.name || `客戶 #${log.customer_id}`,
      title: `使用服務：${log.service?.name || `服務 #${log.service_id}`}`,
      description: `剩餘次數：${log.member_service?.remaining_sessions ?? 0} / ${log.member_service?.total_sessions ?? 0}`,
      notes: log.notes,
      signature_url: log.signature_url,
      raw: log,
    }));

    // 2. 组合包使用日志 (Supabase) —— 加上租户过滤
    let packageQuery = supabase
      .from('service_usage_logs')
      .select(`
        id, created_at, usage_date, notes, signature_url,
        snapshot_package_name, selected_service_ids,
        customer_id,
        customer:customers(name),
        member_service_packages ( snapshot_name ),
        items:service_usage_items ( service_id, service:services(id, name) )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (tenantId) packageQuery = packageQuery.eq('tenant_id', tenantId);
    if (customer_id) packageQuery = packageQuery.eq('customer_id', customer_id);
    if (startDate) packageQuery = packageQuery.gte('usage_date', startDate.toISOString());
    if (endDate) packageQuery = packageQuery.lte('usage_date', endDate.toISOString());

    const { data: packageLogs, error: pkgError, count: packageCount } = await packageQuery;
    if (pkgError) throw new Error(pkgError.message);

    const packageItems = await Promise.all((packageLogs || []).map(async (log: any) => {
      const { data: gifts } = await supabase
        .from('package_gifts')
        .select('gift_description, notes')
        .eq('service_usage_log_id', log.id);

      const serviceNames = (log.items || []).map((item: any) => item.service?.name || `服務 #${item.service_id}`).join('、');
      const snapshotName = log.snapshot_package_name || (log.member_service_packages?.[0] as any)?.snapshot_name || '組合包';
      const giftDescriptions = (gifts || []).map((gift: any) => gift.gift_description).join('、');
      const giftNote = giftDescriptions ? `；贈送禮品：${giftDescriptions}` : '';

      return {
        id: `pkg_${log.id}`,
        type: 'package',
        occurred_at: log.created_at || log.usage_date,
        customer_name: (log.customer as any)?.name || `客戶 #${log.customer_id}`,
        title: `組合包使用：${snapshotName}`,
        description: `使用項目：${serviceNames || '未選擇項目'}${giftNote}`,
        notes: log.notes,
        signature_url: log.signature_url,
        raw: log,
        gifts: gifts || [],
      };
    }));

    // 3. 赠品兑换记录
    let giftQuery = supabase
      .from('package_gifts')
      .select(`
        id, created_at, redeemed_at, gift_description, notes,
        member_package_id,
        member_service_packages ( customer_id, snapshot_name, customer:customers(name) )
      `, { count: 'exact' })
      .eq('is_redeemed', true)
      .is('service_usage_log_id', null)
      .order('redeemed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (tenantId) giftQuery = giftQuery.eq('tenant_id', tenantId);  // 如果 package_gifts 表有 tenant_id 字段
    if (customer_id) giftQuery = giftQuery.eq('member_service_packages.customer_id', customer_id);
    if (startDate) giftQuery = giftQuery.gte('redeemed_at', startDate.toISOString());
    if (endDate) giftQuery = giftQuery.lte('redeemed_at', endDate.toISOString());

    const { data: giftLogs, error: giftError, count: giftCount } = await giftQuery;
    if (giftError) throw new Error(giftError.message);

    const giftItems = (giftLogs || []).map(gift => {
      const pkgRel = gift.member_service_packages as any;
      const customerName = pkgRel?.customer?.name || `客戶 #${pkgRel?.customer_id}`;
      const giftSnapshotName = pkgRel?.snapshot_name || '未知';
      return {
        id: `gift_${gift.id}`,
        type: 'gift',
        occurred_at: gift.redeemed_at || gift.created_at,
        customer_name: customerName,
        title: `兌換贈品：${gift.gift_description}`,
        description: `組合包：${giftSnapshotName}`,
        notes: gift.notes,
        signature_url: null,
        raw: gift,
      };
    });

    let allItems = [...traditionalItems, ...packageItems, ...giftItems];
    allItems.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
    const total = traditionalCount + (packageCount || 0) + (giftCount || 0);
    const pagedItems = allItems.slice(offset, offset + limit);

    return { items: pagedItems, total, page, limit };
  }
}