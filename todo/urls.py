from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/tasks/', views.task_list, name='task_list'),
    path('api/tasks/add/', views.task_add, name='task_add'),
    path('api/tasks/toggle/<int:task_id>/', views.task_toggle, name='task_toggle'),
    path('api/tasks/delete/<int:task_id>/', views.task_delete, name='task_delete'),
    path('api/tasks/update-priority/<int:task_id>/', views.task_update_priority, name='task_update_priority'),
]