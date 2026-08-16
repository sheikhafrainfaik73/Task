from django.contrib import admin
from .models import Task

class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'get_priority_points', 'completed', 'created_at')
    list_filter = ('priority', 'completed')
    search_fields = ('title',)
    ordering = ('-created_at',)
    
    def get_priority_points(self, obj):
        return obj.get_priority_points()
    get_priority_points.short_description = 'Points'

admin.site.register(Task, TaskAdmin)