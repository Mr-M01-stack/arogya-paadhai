import urllib.request
import json

BASE = 'http://localhost:5000'

def test():
    # 1. Health
    r = json.loads(urllib.request.urlopen(f'{BASE}/api/health').read())
    assert r['status'] == 'healthy', 'Health check failed'
    print('1. Health check: OK')

    # 2. Products
    r = json.loads(urllib.request.urlopen(f'{BASE}/api/products').read())
    assert r['count'] >= 18, f'Expected >=18 products, got {r["count"]}'
    print(f'2. Products: {r["count"]} products - OK')

    # 3. Product by slug
    r = json.loads(urllib.request.urlopen(f'{BASE}/api/products/organic-brown-rice-ponni-boiled').read())
    assert r['product']['name'] == 'Organic Brown Rice (Ponni Boiled)'
    print(f'3. Product by slug: {r["product"]["name"]} - OK')

    # 4. Today's products
    r = json.loads(urllib.request.urlopen(f'{BASE}/api/products/today').read())
    assert r['count'] > 0
    print(f'4. Today products: {r["count"]} - OK')

    # 5. Categories
    r = json.loads(urllib.request.urlopen(f'{BASE}/api/categories').read())
    assert r['count'] == 8
    print(f'5. Categories: {r["count"]} - OK')

    # 6. Category by slug
    r = json.loads(urllib.request.urlopen(f'{BASE}/api/categories/grains-cereals').read())
    assert r['category']['name'] == 'Grains & Cereals'
    assert len(r['products']) >= 3
    print(f'6. Category by slug: {r["category"]["name"]} with {len(r["products"])} products - OK')

    # 7. Public enquiry submission
    req = urllib.request.Request(f'{BASE}/api/enquiries',
        data=json.dumps({'name':'Tester','email':'t@t.com','message':'Test msg'}).encode(),
        headers={'Content-Type':'application/json'}, method='POST')
    r = json.loads(urllib.request.urlopen(req).read())
    assert r['enquiry']['name'] == 'Tester'
    print(f'7. Submit enquiry: {r["message"]} - OK')

    # 8. Login
    req = urllib.request.Request(f'{BASE}/api/auth/login',
        data=json.dumps({'email':'admin@arogyapaadhai.com','password':'admin123'}).encode(),
        headers={'Content-Type':'application/json'}, method='POST')
    r = json.loads(urllib.request.urlopen(req).read())
    token = r['token']
    assert r['user']['email'] == 'admin@arogyapaadhai.com'
    print(f'8. Login: OK')

    # 9. Auth - me
    req = urllib.request.Request(f'{BASE}/api/auth/me', headers={'Authorization':f'Bearer {token}'})
    r = json.loads(urllib.request.urlopen(req).read())
    assert r['user']['email'] == 'admin@arogyapaadhai.com'
    print('9. Auth me: OK')

    # 10. Analytics - summary
    req = urllib.request.Request(f'{BASE}/api/analytics/summary', headers={'Authorization':f'Bearer {token}'})
    r = json.loads(urllib.request.urlopen(req).read())
    assert r['total_products'] >= 18
    print(f'10. Analytics summary: {r["total_products"]} products - OK')

    # 11. Analytics - sales by category
    req = urllib.request.Request(f'{BASE}/api/analytics/sales-by-category', headers={'Authorization':f'Bearer {token}'})
    r = json.loads(urllib.request.urlopen(req).read())
    assert len(r['categories']) >= 5
    print(f'11. Sales by category: {len(r["categories"])} categories - OK')

    # 12. Analytics - top products
    req = urllib.request.Request(f'{BASE}/api/analytics/top-products', headers={'Authorization':f'Bearer {token}'})
    r = json.loads(urllib.request.urlopen(req).read())
    assert r['count'] > 0
    print(f'12. Top products: {r["count"]} - OK')

    # 13. Analytics - language usage
    req = urllib.request.Request(f'{BASE}/api/analytics/language-usage', headers={'Authorization':f'Bearer {token}'})
    r = json.loads(urllib.request.urlopen(req).read())
    assert len(r['languages']) == 4
    print(f'13. Language usage: {len(r["languages"])} languages - OK')

    # 14. Analytics - monthly sales
    req = urllib.request.Request(f'{BASE}/api/analytics/monthly-sales', headers={'Authorization':f'Bearer {token}'})
    r = json.loads(urllib.request.urlopen(req).read())
    assert len(r['monthly_sales']) == 6
    print(f'14. Monthly sales: {len(r["monthly_sales"])} months - OK')

    # 15. List enquiries (protected)
    req = urllib.request.Request(f'{BASE}/api/enquiries', headers={'Authorization':f'Bearer {token}'})
    r = json.loads(urllib.request.urlopen(req).read())
    assert r['count'] >= 5
    print(f'15. List enquiries: {r["count"]} total, {r["unread_count"]} unread - OK')

    # 16. Auth - unauthorized
    try:
        req = urllib.request.Request(f'{BASE}/api/auth/me')
        urllib.request.urlopen(req)
        assert False, 'Should have failed'
    except urllib.error.HTTPError as e:
        assert e.code == 401
        print('16. Unauthorized access blocked: OK')

    # 17. Logout
    req = urllib.request.Request(f'{BASE}/api/auth/logout',
        data=b'{}', headers={'Authorization':f'Bearer {token}', 'Content-Type':'application/json'}, method='POST')
    r = json.loads(urllib.request.urlopen(req).read())
    assert r['message'] == 'Logged out successfully'
    print('17. Logout: OK')

    # 18. Token invalid after logout
    try:
        req = urllib.request.Request(f'{BASE}/api/auth/me', headers={'Authorization':f'Bearer {token}'})
        urllib.request.urlopen(req)
        assert False, 'Should have failed'
    except urllib.error.HTTPError as e:
        assert e.code == 401
        print('18. Token revoked after logout: OK')

    print('\n=== ALL 18 TESTS PASSED ===')

if __name__ == '__main__':
    test()
