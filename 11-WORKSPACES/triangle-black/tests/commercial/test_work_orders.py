import uuid
import pytest
test_prefix = 'TEST-PYTEST'

@pytest.fixture(scope='module')
def test_work_order_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        '/api/v1/work-orders/',
        json={
            'hotel_id': 'test_hotel_id',
            'title': f'{test_prefix} Work Order {unique}',
            'description': 'Test work order description',
            'priority': 'medium',
            'technician_id': 'test_technician_id',
            'due_date': '2023-12-31T23:59:59Z',
            'status': 'pending'
        },
        headers=auth
    )
    assert res.status_code == 201, f'Create failed: {res.text}'
    work_order_id = res.json()['id']
    yield work_order_id
    client.delete(f'/api/v1/work-orders/{work_order_id}', headers=auth)

def test_list_work_orders_returns_results(client, auth):
    res = client.get('/api/v1/work-orders/', headers=auth)
    assert res.status_code == 200

def test_get_work_order_by_id_returns_result(client, auth, test_work_order_id):
    res = client.get(f'/api/v1/work-orders/{test_work_order_id}', headers=auth)
    assert res.status_code == 200

@pytest.mark.skip(reason="PUT endpoint not available")
def test_update_work_order_updates_record(client, auth, test_work_order_id):
    unique = str(uuid.uuid4())[:8]
    res = client.put(
        f'/api/v1/work-orders/{test_work_order_id}',
        json={
            'title': f'{test_prefix} Updated Work Order {unique}'
        },
        headers=auth
    )
    assert res.status_code == 200

def test_delete_work_order_deletes_record(client, auth, test_work_order_id):
    res = client.delete(f'/api/v1/work-orders/{test_work_order_id}', headers=auth)
    assert res.status_code == 204