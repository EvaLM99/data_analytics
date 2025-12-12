from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSignupSerializer, EmailTokenObtainSerializer
from django.contrib.auth import get_user_model
from rest_framework import generics
from django.utils.encoding import force_bytes
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

User = get_user_model()

class SignUpView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSignupSerializer
    permission_classes = [AllowAny]

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainSerializer

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def UserProfile(request):
    user = request.user

    # Si c’est un GET → on renvoie les infos
    if request.method == 'GET':
        data = {
            "username": user.username,
            "email": user.email,
            "profile_photo": user.profile_photo.url if user.profile_photo else None
        }
        return Response(data)

    elif request.method == 'PATCH':
        username = request.data.get('username')
        email = request.data.get('email')
        profile_photo = request.data.get('profile_photo')

        if email and User.objects.filter(email=email).exclude(id=user.id).exists():
            return Response({"email": "Cette adresse email est déjà utilisée."}, status=status.HTTP_400_BAD_REQUEST)

        if username:
            user.username = username
        if email:
            user.email = email
        if profile_photo:
            user.profile_photo = profile_photo
        user.save()

        return Response({"message": "Profil mis à jour avec succès"}, status=status.HTTP_200_OK)

@api_view(['GET'])
def check_email(request):
    email = request.GET.get('email')
    if not email:
        return Response({'error': 'Email manquant'}, status=400)
    
    exists = User.objects.filter(email=email).exists()
    return Response({'exists': exists})


class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email requis"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # On ne révèle pas si l'utilisateur existe pour plus de sécurité
            return Response({"message": "Si cet email existe, un mail a été envoyé."}, status=status.HTTP_200_OK)

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        reset_link = f"http://localhost:3000/reset-password/{uid}/{token}"  # frontend URL pour reset

        send_mail(
            "Data analysis - Réinitialisation de mot de passe",
            f"Pour réinitialiser votre mot de passe, cliquez sur ce lien : {reset_link}",
            "no-reply@monapp.com",
            [email],
            fail_silently=False,
        )

        return Response({"message": "Si cet email existe, un mail a été envoyé."}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")

        try:
            uid = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Lien invalide."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Token invalide ou expiré."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()
        return Response({"message": "Mot de passe réinitialisé avec succès !"}, status=status.HTTP_200_OK)
    

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if not user.check_password(current_password):
            return Response({"error": "Mot de passe actuel incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        if current_password == new_password:
            return Response({"error": "Le nouveau mot de passe doit être différent de l'actuel."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Mot de passe changé avec succès."}, status=status.HTTP_200_OK)