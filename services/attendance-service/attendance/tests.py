from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from locations.models import District, Block, LSGI, Ward
from profiles.models import UserProfile
from attendance.models import TrainingSession
from django.utils import timezone

User = get_user_model()

class SessionTests(APITestCase):
    def setUp(self):
        # 1. Setup Geography
        self.district = District.objects.create(name='Test District', code='TD')
        self.block = Block.objects.create(name='Test Block', code='TB', district=self.district)
        self.lsgi = LSGI.objects.create(name='Test LSGI', lsgi_type='GP', district=self.district, block=self.block)
        self.ward = Ward.objects.create(number=1, name='Test Ward', lsgi=self.lsgi)

        # 2. Setup Users
        # District Master Trainer
        self.master_trainer = User.objects.create_user(username='mt', password='pw', role='DISTRICT_MASTER_TRAINER')
        UserProfile.objects.create(user=self.master_trainer, district=self.district)
        
        # Field Trainer
        self.field_trainer = User.objects.create_user(username='ft', password='pw', role='LSGI_FIELD_TRAINER')
        UserProfile.objects.create(user=self.field_trainer, ward=self.ward)
        
        # Citizen
        self.citizen = User.objects.create_user(username='citizen', password='pw', role='CITIZEN')
        UserProfile.objects.create(user=self.citizen, ward=self.ward)

    def test_create_session_authorized(self):
        self.client.force_authenticate(user=self.master_trainer)
        url = reverse('session-list')
        data = {
            'title': 'Safety Session',
            'ward': self.ward.id,
            'category': 'SAFE_TECH',
            'proficiency': 'BEGINNER',
            'date_time': timezone.now(),
            'mode': 'OFFLINE'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TrainingSession.objects.count(), 1)

    def test_create_session_unauthorized(self):
        self.client.force_authenticate(user=self.field_trainer) # Field Trainer cannot create
        url = reverse('session-list')
        data = {
            'title': 'Safety Session',
            'ward': self.ward.id,
            'category': 'SAFE_TECH',
            'proficiency': 'BEGINNER',
            'date_time': timezone.now(),
            'mode': 'OFFLINE'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_session_wrong_geography(self):
        self.client.force_authenticate(user=self.master_trainer)
        
        # Create another district and ward
        other_dist = District.objects.create(name='Other', code='OD')
        other_ward = Ward.objects.create(number=1, name='W', lsgi=LSGI.objects.create(name='L', lsgi_type='GP', district=other_dist))
        
        url = reverse('session-list')
        data = {
            'title': 'Wrong Geo Session',
            'ward': other_ward.id, # Trying to create in another district
            'category': 'SAFE_TECH',
            'proficiency': 'BEGINNER',
            'date_time': timezone.now(),
            'mode': 'OFFLINE'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('assigned District', str(response.data))
