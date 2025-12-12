from rest_framework import serializers
from django.contrib.auth import get_user_model


User = get_user_model()

# -------------------
# Serializer pour Signup
# -------------------
class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    profile_photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'profile_photo']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cette adresse e-mail est déjà utilisée")
        return value

    def create(self, validated_data):
        profile_photo = validated_data.get('profile_photo', None)
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            profile_photo=profile_photo
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

# -------------------
# Serializer pour login JWT via email
# -------------------
class EmailTokenObtainSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        # récupère l’utilisateur par email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Email ou mot de passe incorrect")

        if not user.check_password(password):
            raise serializers.ValidationError("Email ou mot de passe incorrect")

        # création des tokens JWT
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "email": user.email,
            "username": user.username,
        }
