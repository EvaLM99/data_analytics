from django.db import models
from authentication.models import User 
from django.contrib.postgres.fields import JSONField

# Create your models here.

class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")
    name = models.CharField(max_length=200)
    sheet_data = models.JSONField(default=dict)  # stocke les cellules, ex: {"A1": "10", "B2": "=SUM(A1:A3)"}
    charts = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name