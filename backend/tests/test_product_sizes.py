import json
import pytest
from backend.app import create_app, db
from backend.app.models import User, Product, ProductSize
from flask_jwt_extended import create_access_token

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['MAIL_SUPPRESS_SEND'] = True
    with app.app_context():
        db.drop_all()
        db.create_all()
        yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def admin_token(app):
    with app.app_context():
        admin = User(email='admin@example.com')
        admin.set_password('password')
        admin.is_admin = True
        db.session.add(admin)
        db.session.commit()
        token = create_access_token(identity=str(admin.id))
        return token

@pytest.fixture
def regular_token(app):
    with app.app_context():
        user = User(email='user@example.com')
        user.set_password('password')
        user.is_admin = False
        db.session.add(user)
        db.session.commit()
        token = create_access_token(identity=str(user.id))
        return token

@pytest.fixture
def product(app):
    with app.app_context():
        p = Product(category_id='casket_list', title='Test Casket', description='Test', price=100000, has_sizes=True)
        db.session.add(p)
        db.session.commit()
        return p


def test_admin_can_create_update_delete_size(client, admin_token, product, app):
    headers = { 'Authorization': f'Bearer {admin_token}', 'Content-Type': 'application/json' }

    # create size
    res = client.post(f'/api/admin/products/{product.id}/sizes', headers=headers, data=json.dumps({ 'label': 'Normal (Standard)', 'price_modifier': 0 }))
    assert res.status_code == 201
    body = res.get_json()
    assert body['label'] == 'Normal (Standard)'
    size_id = body['id']

    # update size
    res2 = client.put(f'/api/admin/products/{product.id}/sizes/{size_id}', headers=headers, data=json.dumps({ 'label': 'Normal (Updated)', 'price_modifier': 1000 }))
    assert res2.status_code == 200
    body2 = res2.get_json()
    assert body2['label'] == 'Normal (Updated)'
    assert float(body2['price_modifier']) == 1000.0

    # ensure product detail exposes sizes
    res3 = client.get(f'/api/products/{product.id}')
    assert res3.status_code == 200
    pbody = res3.get_json()
    assert any(s['id'] == size_id for s in pbody.get('sizes', []))

    # delete size
    res4 = client.delete(f'/api/admin/products/{product.id}/sizes/{size_id}', headers=headers)
    assert res4.status_code == 200

    res5 = client.get(f'/api/products/{product.id}')
    pbody2 = res5.get_json()
    assert all(s['id'] != size_id for s in pbody2.get('sizes', []))


def test_non_admin_cannot_create_size(client, regular_token, product):
    headers = { 'Authorization': f'Bearer {regular_token}', 'Content-Type': 'application/json' }
    res = client.post(f'/api/admin/products/{product.id}/sizes', headers=headers, data=json.dumps({ 'label': 'X', 'price_modifier': 0 }))
    assert res.status_code == 403
