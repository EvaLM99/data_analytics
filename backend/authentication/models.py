from django.db import models
from django.contrib.auth.models import AbstractUser
from PIL import Image
import os
import uuid

def profile_photo_upload_to(instance, filename):
    """
    Génère un nom de fichier unique basé sur un UUID.
    Exemple : profile_photos/3a92b8ef-9b8e-4e0b-9e4c-1b1e2f42b812.jpg
    """
    ext = filename.split('.')[-1]  # récupère l’extension (jpg, png…)
    return f"profile_photos/{uuid.uuid4()}.{ext}"


class User(AbstractUser):
    profile_photo = models.ImageField(
        verbose_name="Photo de profil",
        upload_to=profile_photo_upload_to,
        blank=True,
        null=True
    )

    def save(self, *args, **kwargs):
        # --- Supprimer l’ancienne image si elle change ---
        try:
            old_user = User.objects.get(pk=self.pk)
            if old_user.profile_photo and old_user.profile_photo != self.profile_photo:
                old_path = old_user.profile_photo.path
                if os.path.exists(old_path):
                    os.remove(old_path)
        except User.DoesNotExist:
            pass  # cas de création

        # Sauvegarde du nouvel utilisateur
        super().save(*args, **kwargs)

        # --- Redimensionnement automatique à 400x400 ---
        if self.profile_photo:
            img_path = self.profile_photo.path
            try:
                img = Image.open(img_path).convert("RGB")
                img.thumbnail((400, 400), Image.Resampling.LANCZOS)

                # Création d’un carré 400x400 centré
                width, height = img.size
                new_img = Image.new("RGB", (400, 400), (255, 255, 255))
                left = (400 - width) // 2
                top = (400 - height) // 2
                new_img.paste(img, (left, top))

                new_img.save(img_path, format="JPEG", quality=90)
            except Exception as e:
                print(f"Erreur lors du redimensionnement de l'image : {e}")
