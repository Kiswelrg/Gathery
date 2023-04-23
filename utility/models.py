from django.db import models

# Create your models here.

class City(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    name = models.CharField(max_length=50)
    ascii = models.CharField(max_length=50)
    lat = models.DecimalField(max_digits=10, decimal_places=7)
    lng = models.DecimalField(max_digits=10, decimal_places=7)
    country = models.CharField(max_length=50, null=True)
    iso2 = models.CharField(max_length=2)
    iso3 = models.CharField(max_length=3)
    admin_name = models.CharField(max_length=50)
    capital = models.CharField(
        max_length=50,
        default=''
        )
    population = models.PositiveIntegerField(default=0)