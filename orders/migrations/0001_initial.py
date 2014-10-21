# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('items', '__first__'),
    ]

    operations = [
        migrations.CreateModel(
            name='Assignment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('is_active', models.BooleanField(default=True, help_text=b'Whether this item is active, use this instead of deleting')),
                ('created_on', models.DateTimeField(help_text=b'When this item was originally created', auto_now_add=True)),
                ('modified_on', models.DateTimeField(help_text=b'When this item was last modified', auto_now=True)),
                ('date', models.DateTimeField(auto_now=True, auto_now_add=True)),
                ('created_by', models.ForeignKey(related_name='orders_assignment_creations', to=settings.AUTH_USER_MODEL, help_text=b'The user which originally created this item')),
                ('item', models.ForeignKey(to='items.Item')),
                ('modified_by', models.ForeignKey(related_name='orders_assignment_modifications', to=settings.AUTH_USER_MODEL, help_text=b'The user which last modified this item')),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('is_active', models.BooleanField(default=True, help_text=b'Whether this item is active, use this instead of deleting')),
                ('created_on', models.DateTimeField(help_text=b'When this item was originally created', auto_now_add=True)),
                ('modified_on', models.DateTimeField(help_text=b'When this item was last modified', auto_now=True)),
                ('address', models.CharField(help_text=b'Where should we deliver, 140 characters.', max_length=140)),
                ('stage', models.CharField(default=b'S', help_text=b'The state of this order', max_length=1)),
                ('mobile', models.CharField(help_text=b'A number we can reach at.', max_length=15)),
                ('comment', models.TextField(help_text=b'Anything else, in 140 characters.', max_length=140)),
                ('created_by', models.ForeignKey(related_name='orders_order_creations', to=settings.AUTH_USER_MODEL, help_text=b'The user which originally created this item')),
                ('modified_by', models.ForeignKey(related_name='orders_order_modifications', to=settings.AUTH_USER_MODEL, help_text=b'The user which last modified this item')),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='OrderList',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('is_active', models.BooleanField(default=True, help_text=b'Whether this item is active, use this instead of deleting')),
                ('created_on', models.DateTimeField(help_text=b'When this item was originally created', auto_now_add=True)),
                ('modified_on', models.DateTimeField(help_text=b'When this item was last modified', auto_now=True)),
                ('title', models.CharField(help_text=b'List name.', max_length=60)),
                ('scheduled_time', models.CharField(help_text=b'When work should be done.', max_length=100, null=True, blank=True)),
                ('created_by', models.ForeignKey(related_name='orders_orderlist_creations', to=settings.AUTH_USER_MODEL, help_text=b'The user which originally created this item')),
                ('modified_by', models.ForeignKey(related_name='orders_orderlist_modifications', to=settings.AUTH_USER_MODEL, help_text=b'The user which last modified this item')),
                ('order', models.ForeignKey(related_name=b'order_lists', blank=True, to='orders.Order', help_text=b'when created.', null=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL, null=True)),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='assignment',
            name='orderlist',
            field=models.ForeignKey(to='orders.OrderList'),
            preserve_default=True,
        ),
    ]
