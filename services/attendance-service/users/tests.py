from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from locations.models import District

User = get_user_model()

class AuthTests(APITestCase):
    def test_registration(self):
        url = reverse('auth_register')
        data = {
            'username': 'testcitizen',
            'password': 'password123',
            'email': 'citizen@example.com',
            'role': 'CITIZEN'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().role, 'CITIZEN')

    def test_login(self):
        # Create user
        user = User.objects.create_user(username='testuser', password='password123')
        
        # Login
        url = reverse('token_obtain_pair')
        data = {'username': 'testuser', 'password': 'password123'}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

class LocationTests(APITestCase):
    def setUp(self):
        District.objects.create(name='Test District', code='TD')

    def test_list_districts(self):
        url = reverse('district_list')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # We seeded data, but TestCase uses a separate blank DB transaction usually. 
        # But wait, seed_geography runs on the main DB. Test runs on test_db.
        # My setUp created 1. So count should be 1.
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test District')
