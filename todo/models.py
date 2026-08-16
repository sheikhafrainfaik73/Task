from django.db import models

class Task(models.Model):
    # Define priority choices
    PRIORITY_CHOICES = [
        ('high', 'High Priority'),
        ('medium', 'Medium Priority'),
        ('low', 'Low Priority'),
    ]
    
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
    def get_priority_points(self):
        """Return points based on priority"""
        priority_points = {
            'high': 3,
            'medium': 2,
            'low': 1
        }
        return priority_points.get(self.priority, 0)
        