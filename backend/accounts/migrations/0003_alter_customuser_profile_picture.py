# Generated by Django 5.1.4 on 2025-01-03 11:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_customuser_profile_picture_alter_customuser_username'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='profile_picture',
            field=models.ImageField(blank=True, default='profile_pictures/img.jpg', null=True, upload_to='profile_pictures/'),
        ),
    ]
