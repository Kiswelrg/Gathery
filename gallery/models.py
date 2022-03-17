from email.policy import default
from django.db import models
from django.core import validators
from django.db.models.base import Model
from django.db.models.fields import CharField
from django.utils import timezone
from django.utils.translation import deactivate
from .utils import getArtId,getGalleryId
from .utils import getArtistCode,getArtCode,getGalleryCode,getWarehouseCode
from utility.models import City

class Artist(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    name = models.CharField(max_length=35,default='some_artist',null=True)
    urlCode = models.IntegerField(default=getArtistCode, unique=True, db_index=True)                                      #7 digits
    y_born = models.PositiveSmallIntegerField(blank=True,null=True)
    y_pass = models.PositiveSmallIntegerField(blank=True,null=True)
    date_add = models.DateTimeField(default=timezone.now)
    art_num = models.PositiveIntegerField(default=0)
    v_factor = models.PositiveIntegerField(default=0)
    areas = models.PositiveIntegerField(default=0)

class Art(models.Model):
    ownership_status = [
        ('1', 'gallery property'),
        ('0', 'no owner')
    ]
    art_status = [
        ('0', 'destroyed'),
        ('1', 'in gallery'),
        ('2', 'in transit'),
        ('3', 'in borrow'),
        ('4', 'borrowed'),
        ('5', 'sold'),
    ]
    urlCode = models.IntegerField(default=getArtCode, unique=True, db_index=True)
    name = models.CharField(max_length=50,default='some_artwork')
    id = models.CharField(      
        primary_key=True,                                                  #A-Z0-9十位串
        unique=True,
        db_index=True,
        max_length=8,
        validators=[
            validators.RegexValidator(
                regex='^(?=.{8}$)(?![0-9])[a-zA-Z0-9]+$',
                message='Enter a valid username',
            ),
        ],
        default=getArtId,
    )
    date_made = models.DateTimeField(default=timezone.now)
    date_add = models.DateTimeField(default=timezone.now)
    warehouse = models.ForeignKey('Warehouse', on_delete=models.CASCADE, null=True)
    last_transit = models.DateTimeField(default=timezone.now)
    rack = models.CharField(max_length=16,null=True,default='')
    type= models.PositiveSmallIntegerField(default=0)
    author = models.CharField(max_length=48, default='')
    artists = models.ManyToManyField(
        Artist,
        through='AA_creation',
        # through_fields=('gallery', 'warehouse'),
    )
    status = models.CharField(
        max_length=2,
        choices=art_status,
        default='1'
    )
    picture = models.ImageField(blank=True, default='')
    info = models.FileField(blank=True, default='')

    # def save(self, *args, **kwargs):
    #     if self.urlCode == 0:
    #         self.urlCode = ()
    #     if self.id == '':
    #         self.id = ()
    #     super().save(*args, **kwargs)



class Warehouse(models.Model):
    warehouse_status = [
        ('0', 'closed'),
        ('1', 'open'),
        ('2', 'under construction'),
        ('3', 'destroyed')
    ]
    id = models.AutoField(primary_key=True, unique=True)
    name = models.CharField(max_length=30,default='warehouse*',null=True)
    urlCode = models.IntegerField(default=getWarehouseCode, unique=True, db_index=True)                              #8 digits
    gallery = models.ForeignKey('Gallery', on_delete=models.CASCADE, related_name='warehouses')
    date_create = models.DateTimeField(default=timezone.now)
    date_add = models.DateTimeField(default=timezone.now)
    staff = models.ManyToManyField(
        'user.User',
        through='WU_Relation',
    )
    status = models.CharField(
        max_length=2,
        choices=warehouse_status,
        default='1'
    )
    art_num = models.PositiveIntegerField(default=0)



class Gallery(models.Model):
    gallery_status = [
        ('0', 'closed'),
        ('1', 'open'),
        ('2', 'under construction'),
        ('3', 'destroyed')
    ]
    id = models.AutoField(primary_key=True, unique=True)
    name = models.CharField(max_length=30,default='some_gallery',null=True)
    urlCode = models.IntegerField(default=getGalleryCode, unique=True, db_index=True)                                           #7 digits
    galleryId = models.CharField(                                                        #A-Z0-9十位串
        unique=True,
        max_length=10,
        validators=[
            validators.RegexValidator(
                regex='^(?=.{10,10}$)(?![0-9])[A-Z0-9]+$',
                message='Enter a valid username',
            ),
        ],
        default=getGalleryId,
    )
    date_create = models.DateTimeField(default=timezone.now)
    date_add = models.DateTimeField(default=timezone.now)
    staff = models.ManyToManyField(
        'user.User',
        through='GU_Relation',
        related_name='galleries',
    )
    status = models.CharField(
        max_length=2,
        choices=gallery_status,
        default='1'
    )
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True)
    warehouse_num = models.PositiveIntegerField(default=0)
    art_num = models.PositiveIntegerField(default=0)
    logo = models.ImageField(blank=True, default='')
    info = models.FileField(blank=True, default='')
    


class AA_creation(models.Model):
    art = models.ForeignKey(Art, on_delete=models.CASCADE)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    work = CharField(max_length=50,blank=True,null=True)

class GU_Relation_old(models.Model):
    role_choices = [
        ('0', 'owner'),
        ('1', 'administrator'),
        ('2', 'manager'),
        ('3', 'staff')
    ]
    gallery = models.ForeignKey(
        Gallery,
        on_delete=models.CASCADE
    )
    staff_member = models.ForeignKey(
        'user.User',
        on_delete=models.CASCADE
    )
    role = models.CharField(
        max_length=2,
        choices=role_choices,
        null=True,
        default=''
    )
    privilege = models.PositiveSmallIntegerField(       #15 options max
        default=0,
        null=True
    )
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        null=True,
        default=None
    )

    def save(self, *args, **kwargs):
        """ 
        001110011100111
        |||||||||||||||
        FEDCBA987654321
        ||||||||||||||└─ search
        |||||||||||||└── insert
        ||||||||||||└─── update          
        |||||||||||└──── grant 👆       #staff
        ||||||||||└───── create new W
        |||||||||└────── update any W    
        ||||||||└─────── grant 👆       #manager
        |||||||└──────── update G info   
        ||||||└───────── grant 👆       #admin
        |||||└────────── grant 👆       #owner
        ||||└───────────
        |||└────────────
        ||└─────────────
        |└──────────────
        └───────────────

        """
        role_privilege = {          # default privilege
            '0': 0b000000111111111, # 'owner',
            '1': 0b000000011111111, # 'administrator',
            '2': 0b000000000111111, # 'manager',
            '3': 0b000000000000001, # 'staff'
        }
        if self.role == '' and self.warehouse == None:
            return                  # don't save

        if self.role is not None and self.role != '':
            self.warehouse = None
            if self.privilege == 0:
                self.privilege = role_privilege[self.role]
        
        super().save(*args, **kwargs)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['warehouse', 'staff_member'], name='r_unique_wu'),
            models.UniqueConstraint(fields=['gallery','warehouse', 'staff_member'], name='r_unique_gwu'),
        ]

class GU_Relation(models.Model):
    role_choices = [
        ('0', 'owner'),
        ('1', 'administrator'),
        ('2', 'manager'),
        ('3', 'staff')
    ]
    status_choices = [
        ('0', '在职'),
        ('1', '离职'),
        ('2', '出差'),
        ('3', '在线'),
        ('4', '离线'),
    ]
    gallery = models.ForeignKey(
        Gallery,
        on_delete=models.CASCADE
    )
    staff_member = models.ForeignKey(
        'user.User',
        on_delete=models.CASCADE
    )
    role = models.CharField(
        max_length=2,
        choices=role_choices,
        null=True,
        default='3'
    )
    privilege = models.PositiveSmallIntegerField(       #15 options max
        default=0,
        null=True
    )
    status = models.CharField(
        max_length=2,
        choices=status_choices,
        null=True,
        default='0'
    )
    date_join = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        role_privilege = {          # default privilege
            '0': 0b000000111111111, # 'owner',
            '1': 0b000000011111111, # 'administrator',
            '2': 0b000000000111111, # 'manager',
            '3': 0b000000000000001, # 'staff'
        }
        if self.role is None or self.role == '':
            return                  #don't save
    
        if self.privilege == 0:
            self.privilege = role_privilege[self.role]
        
        super().save(*args, **kwargs)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['gallery', 'staff_member'], name='unique_gu'),
        ]

class WU_Relation(models.Model):
    status_choices = [
        ('0', '在职'),
        ('1', '离职'),
        ('2', '出差'),
        ('3', '在线'),
        ('4', '离线'),
    ]
    staff_member = models.ForeignKey(
        'user.User',
        on_delete=models.CASCADE
    )
    privilege = models.PositiveSmallIntegerField(       #15 options max
        default=0,
        null=True
    )
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
    )
    date_join = models.DateTimeField(default=timezone.now)
    status = models.CharField(
        max_length=2,
        choices=status_choices,
        null=True,
        default='0'
    )

    def save(self, *args, **kwargs):
        role_privilege = {
            '0': 0b000000111111111, # 'owner',
            '1': 0b000000011111111, # 'administrator',
            '2': 0b000000000111111, # 'manager',
            '3': 0b000000000000001, # 'staff'
        }
        if self.warehouse == 0:
            return                  #don't save
        if self.privilege == 0:
            self.privilege = 1
        super().save(*args, **kwargs)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['warehouse', 'staff_member'], name='unique_wu'),
        ]


# class WA_Collection(models.Model):
#     art_status = [
#         ('0', 'destroyed'),
#         ('1', 'in gallery'),
#         ('2', 'in transit'),
#         ('3', 'in borrow'),
#         ('4', 'borrowed'),
#         ('5', 'sold'),
#     ]
#     gallery = models.ForeignKey(Gallery, on_delete=models.CASCADE)
#     art = models.OneToOneField(Art, on_delete=models.CASCADE)
#     warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
#     rack = models.CharField(max_length=10,null=True,default=None)
#     status = models.CharField(
#         max_length=2,
#         choices=art_status,
#         default='1'
#     )

# class GW_Attach(models.Model):
#     gallery = models.ForeignKey(Gallery, on_delete=models.CASCADE)
#     warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
#     w_status = [
#         ('0', 'closed'),
#         ('1', 'open'),
#         ('2', 'under construction'),
#         ('3', 'destroyed')
#     ]
#     status = models.CharField(
#         max_length=2,
#         choices=w_status,
#         default='1'
#     )


