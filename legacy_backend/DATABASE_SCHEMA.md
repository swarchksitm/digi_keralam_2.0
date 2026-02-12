# Database Schema Documentation

Generated from current database structure.

## Table: AuthGroup
**DB Table Name**: `auth_group`

| Field Name | Data Type | Attributes |
|---|---|---|
| **name** | CharField | `unique=True, max_length=150` |

---

## Table: AuthGroupPermissions
**DB Table Name**: `auth_group_permissions`

| Field Name | Data Type | Attributes |
|---|---|---|
| **id** | BigAutoField | `primary_key=True` |
| **group** | ForeignKey | `AuthGroup, models.DO_NOTHING` |
| **permission** | ForeignKey | `'AuthPermission', models.DO_NOTHING` |

---

## Table: AuthPermission
**DB Table Name**: `auth_permission`

| Field Name | Data Type | Attributes |
|---|---|---|
| **name** | CharField | `max_length=255` |
| **content_type** | ForeignKey | `'DjangoContentType', models.DO_NOTHING` |
| **codename** | CharField | `max_length=100` |

---

## Table: DjangoAdminLog
**DB Table Name**: `django_admin_log`

| Field Name | Data Type | Attributes |
|---|---|---|
| **action_time** | DateTimeField | `` |
| **object_id** | TextField | `blank=True, null=True` |
| **object_repr** | CharField | `max_length=200` |
| **action_flag** | SmallIntegerField | `` |
| **change_message** | TextField | `` |
| **content_type** | ForeignKey | `'DjangoContentType', models.DO_NOTHING, blank=True, null=True` |
| **user** | ForeignKey | `'UsersUser', models.DO_NOTHING` |

---

## Table: DjangoContentType
**DB Table Name**: `django_content_type`

| Field Name | Data Type | Attributes |
|---|---|---|
| **app_label** | CharField | `max_length=100` |
| **model** | CharField | `max_length=100` |

---

## Table: DjangoMigrations
**DB Table Name**: `django_migrations`

| Field Name | Data Type | Attributes |
|---|---|---|
| **id** | BigAutoField | `primary_key=True` |
| **app** | CharField | `max_length=255` |
| **name** | CharField | `max_length=255` |
| **applied** | DateTimeField | `` |

---

## Table: DjangoSession
**DB Table Name**: `django_session`

| Field Name | Data Type | Attributes |
|---|---|---|
| **session_key** | CharField | `primary_key=True, max_length=40` |
| **session_data** | TextField | `` |
| **expire_date** | DateTimeField | `` |

---

## Table: LocationsBlock
**DB Table Name**: `locations_block`

| Field Name | Data Type | Attributes |
|---|---|---|
| **id** | BigAutoField | `primary_key=True` |
| **name** | CharField | `max_length=100` |
| **code** | CharField | `unique=True, max_length=10` |
| **district** | ForeignKey | `'LocationsDistrict', models.DO_NOTHING` |

---

## Table: LocationsDistrict
**DB Table Name**: `locations_district`

| Field Name | Data Type | Attributes |
|---|---|---|
| **id** | BigAutoField | `primary_key=True` |
| **name** | CharField | `unique=True, max_length=100` |
| **code** | CharField | `unique=True, max_length=10` |

---

## Table: LocationsLsgi
**DB Table Name**: `locations_lsgi`

| Field Name | Data Type | Attributes |
|---|---|---|
| **id** | BigAutoField | `primary_key=True` |
| **name** | CharField | `max_length=100` |
| **lsgi_type** | CharField | `max_length=20` |
| **block** | ForeignKey | `LocationsBlock, models.DO_NOTHING, blank=True, null=True` |
| **district** | ForeignKey | `LocationsDistrict, models.DO_NOTHING` |

---

## Table: LocationsWard
**DB Table Name**: `locations_ward`

| Field Name | Data Type | Attributes |
|---|---|---|
| **id** | BigAutoField | `primary_key=True` |
| **number** | IntegerField | `` |
| **name** | CharField | `max_length=100` |
| **lsgi** | ForeignKey | `LocationsLsgi, models.DO_NOTHING` |

---

## Table: ProfilesUserprofile
**DB Table Name**: `profiles_userprofile`

| Field Name | Data Type | Attributes |
|---|---|---|
| **id** | BigAutoField | `primary_key=True` |
| **created_at** | DateTimeField | `` |
| **updated_at** | DateTimeField | `` |
| **block** | ForeignKey | `LocationsBlock, models.DO_NOTHING, blank=True, null=True` |
| **district** | ForeignKey | `LocationsDistrict, models.DO_NOTHING, blank=True, null=True` |
| **lsgi** | ForeignKey | `LocationsLsgi, models.DO_NOTHING, blank=True, null=True` |
| **user** | OneToOneField | `'UsersUser', models.DO_NOTHING` |
| **ward** | ManyToManyField | `models.ManyToManyField(Ward)` |

---

## Table: TrainingSessionsAttendance
**DB Table Name**: `training_sessions_attendance`

| Field Name | Data Type | Attributes |
|---|---|---|
| **id** | BigAutoField | `primary_key=True` |
| **status** | CharField | `max_length=10` |
| **marked_at** | DateTimeField | `` |
| **citizen** | ForeignKey | `'UsersUser', models.DO_NOTHING` |
| **session** | ForeignKey | `'TrainingSessionsTrainingsession', models.DO_NOTHING` |

---

## Table: TrainingSessionsSessionassignment
**DB Table Name**: `training_sessions_sessionassignment`

| Field Name | Data Type | Attributes |
|---|---|---|
| **id** | BigAutoField | `primary_key=True` |
| **assigned_at** | DateTimeField | `` |
| **trainer** | ForeignKey | `'UsersUser', models.DO_NOTHING` |
| **session** | ForeignKey | `'TrainingSessionsTrainingsession', models.DO_NOTHING` |

---

## Table: TrainingSessionsTrainingsession
**DB Table Name**: `training_sessions_trainingsession`

| Field Name | Data Type | Attributes |
|---|---|---|
| **id** | BigAutoField | `primary_key=True` |
| **title** | CharField | `max_length=200` |
| **description** | TextField | `` |
| **category** | CharField | `max_length=20` |
| **proficiency** | CharField | `max_length=20` |
| **mode** | CharField | `max_length=10` |
| **status** | CharField | `max_length=20` |
| **date_time** | DateTimeField | `` |
| **venue** | CharField | `max_length=255` |
| **created_at** | DateTimeField | `` |
| **updated_at** | DateTimeField | `` |
| **created_by** | ForeignKey | `'UsersUser', models.DO_NOTHING` |
| **ward** | ForeignKey | `LocationsWard, models.DO_NOTHING` |

---

## Table: UsersUser
**DB Table Name**: `users_user`

| Field Name | Data Type | Attributes |
|---|---|---|
| **id** | BigAutoField | `primary_key=True` |
| **password** | CharField | `max_length=128` |
| **last_login** | DateTimeField | `blank=True, null=True` |
| **is_superuser** | BooleanField | `` |
| **username** | CharField | `unique=True, max_length=150` |
| **first_name** | CharField | `max_length=150` |
| **last_name** | CharField | `max_length=150` |
| **email** | CharField | `max_length=254` |
| **is_staff** | BooleanField | `` |
| **is_active** | BooleanField | `` |
| **date_joined** | DateTimeField | `` |
| **role** | CharField | `max_length=50` |
| **phone** | CharField | `unique=True, max_length=15, blank=True, null=True` |
| **is_verified** | BooleanField | `` |

---

## Table: UsersUserGroups
**DB Table Name**: `users_user_groups`

| Field Name | Data Type | Attributes |
|---|---|---|
| **id** | BigAutoField | `primary_key=True` |
| **user** | ForeignKey | `UsersUser, models.DO_NOTHING` |
| **group** | ForeignKey | `AuthGroup, models.DO_NOTHING` |

---

## Table: UsersUserUserPermissions
**DB Table Name**: `users_user_user_permissions`

| Field Name | Data Type | Attributes |
|---|---|---|
| **id** | BigAutoField | `primary_key=True` |
| **user** | ForeignKey | `UsersUser, models.DO_NOTHING` |
| **permission** | ForeignKey | `AuthPermission, models.DO_NOTHING` |

---

