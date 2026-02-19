from django.db import models
from django.utils.translation import gettext_lazy as _

class District(models.Model):
    name = models.CharField(max_length=100, unique=True)
    name_mal = models.CharField(max_length=100, blank=True, null=True, verbose_name="District Name (Malayalam)")
    code = models.CharField(max_length=10, unique=True, help_text="Official district code")

    def __str__(self):
        return f"{self.name} / {self.name_mal}" if self.name_mal else self.name

    class Meta:
        ordering = ['name']

class Block(models.Model):
    name = models.CharField(max_length=100)
    name_mal = models.CharField(max_length=100, blank=True, null=True, verbose_name="Block Name (Malayalam)")
    code = models.CharField(max_length=10, unique=True, help_text="Official block code")
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='blocks')

    def __str__(self):
        return f"{self.name} ({self.district.name})"

    class Meta:
        ordering = ['name']

class LSGI(models.Model):
    class Type(models.TextChoices):
        GRAMA_PANCHAYAT = 'GP', _('Grama Panchayat')
        MUNICIPALITY = 'MUNICIPALITY', _('Municipality')
        CORPORATION = 'CORPORATION', _('Corporation')
        BLOCK_PANCHAYAT = 'BP', _('Block Panchayat')
        DISTRICT_PANCHAYAT = 'DP', _('District Panchayat')

    name = models.CharField(max_length=100)
    name_mal = models.CharField(max_length=100, blank=True, null=True, verbose_name="LSGI Name (Malayalam)")
    lsgi_type = models.CharField(max_length=20, choices=Type.choices)
    code = models.CharField(max_length=20, unique=True, null=True, blank=True, help_text="LSGI Code (LBCode)")
    block = models.ForeignKey(Block, on_delete=models.CASCADE, related_name='lsgis', null=True, blank=True)
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='lsgis', help_text="Direct link for Corporations/Municipalities not under a Block")

    class Meta:
        verbose_name = "Local Self Govt Institution"
        verbose_name_plural = "LSGIs"
        unique_together = ('name', 'district', 'lsgi_type')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_lsgi_type_display()})"

class Ward(models.Model):
    number = models.PositiveIntegerField()
    name = models.CharField(max_length=100)
    name_mal = models.CharField(max_length=100, blank=True, null=True, verbose_name="Ward Name (Malayalam)")
    lsgi = models.ForeignKey(LSGI, on_delete=models.CASCADE, related_name='wards')
    
    class Meta:
        unique_together = ('number', 'lsgi')
        ordering = ['lsgi', 'number']

    def __str__(self):
        return f"{self.lsgi.name} - Ward {self.number}: {self.name}"
