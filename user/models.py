from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone
from .utils import getUserCode

# Create your models here.
class User(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    name = models.CharField(max_length=20,default='some_user')
    urlCode = models.IntegerField(default=getUserCode, unique=True, db_index=True)
    username = models.CharField(                                                        #只能包含_和数字 开头不能有数字或_ _不能2连 结尾不能_
        unique=True,
        null=False,
        blank=False,
        db_index=True,
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^(?=.{6,20}$)(?![_0-9])(?!.*[_]{2})[a-zA-Z0-9_]+(?<![_])$',
                message='Enter a valid username',
                code='invalid_username'
            ),
        ]
    )
    password = models.CharField(max_length=64)
    sex = models.PositiveSmallIntegerField(default=None,blank=True,null=True)
    age = models.PositiveSmallIntegerField(default=None,blank=True,null=True)
    artist = models.OneToOneField(
        'gallery.Artist',
        on_delete=models.SET_NULL,
        related_name='artist_of',
        null=True,
        blank=True,
        default=None
    )
    date_add = models.DateTimeField(default=timezone.now)
    areas = models.PositiveIntegerField(default=0)
    info = models.FileField(default=None,blank=True,null=True)

