import json
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Task

def index(request):
    return render(request, 'todo/index.html')

def task_list(request):
    # Get all tasks with priority and points
    tasks = list(Task.objects.all().order_by(
        # Order by priority (high first)
        '-created_at'
    ).values(
        'id', 
        'title', 
        'completed',
        'priority',
    ))
    
    # Add priority points to each task
    for task in tasks:
        priority_points = {
            'high': 3,
            'medium': 2,
            'low': 1
        }
        task['priority_points'] = priority_points.get(task['priority'], 0)
    
    return JsonResponse(tasks, safe=False)

@require_http_methods(['POST'])
def task_add(request):
    data = json.loads(request.body)
    title = data.get('title', '').strip()
    priority = data.get('priority', 'medium')  # Get priority from request
    
    if not title:
        return JsonResponse({'error': 'Title is required'}, status=400)
    
    # Create task with priority
    task = Task.objects.create(
        title=title,
        priority=priority
    )
    
    # Get priority points
    priority_points = {
        'high': 3,
        'medium': 2,
        'low': 1
    }
    
    return JsonResponse({
        'id': task.id, 
        'title': task.title, 
        'completed': task.completed,
        'priority': task.priority,
        'priority_points': priority_points.get(task.priority, 0)
    })

@require_http_methods(['POST'])
def task_toggle(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    task.completed = not task.completed
    task.save()
    return JsonResponse({'id': task.id, 'completed': task.completed})

@require_http_methods(['POST'])
def task_delete(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    task.delete()
    return JsonResponse({'deleted': task_id})

# Optional: New view to update priority
@require_http_methods(['POST'])
def task_update_priority(request, task_id):
    data = json.loads(request.body)
    new_priority = data.get('priority', 'medium')
    
    task = get_object_or_404(Task, id=task_id)
    task.priority = new_priority
    task.save()
    
    priority_points = {
        'high': 3,
        'medium': 2,
        'low': 1
    }
    
    return JsonResponse({
        'id': task.id,
        'priority': task.priority,
        'priority_points': priority_points.get(task.priority, 0)
    })
