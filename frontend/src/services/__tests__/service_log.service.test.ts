import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getServiceLogs, createServiceLog } from '../service_log.service';

const mock = new MockAdapter(axios);

describe('frontend service_log.service', () => {
  afterEach(() => {
    mock.reset();
  });

  test('getServiceLogs 应发送 GET 请求并返回数据', async () => {
    const mockData = [{ id: 1, service_name: '剪发' }];
    mock.onGet('/api/service-logs').reply(200, mockData);

    const result = await getServiceLogs();
    expect(result).toEqual(mockData);
    expect(mock.history.get[0].url).toBe('/api/service-logs');
  });

  test('createServiceLog 应发送 POST 请求并返回响应', async () => {
    const payload = { member_id: 1, service_id: 2 };
    mock.onPost('/api/service-logs').reply(201, { success: true });

    const result = await createServiceLog(payload);
    expect(result).toEqual({ success: true });
    expect(JSON.parse(mock.history.post[0].data)).toEqual(payload);
  });
});