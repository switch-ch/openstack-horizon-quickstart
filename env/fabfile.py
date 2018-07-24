# -*- coding: utf-8 -*-
#
# Iterativ GmbH
# http://www.iterativ.ch/
#
# Copyright (c) 2015 Iterativ GmbH. All rights reserved.
#
# Created on 02/06/15
# @author: pawel

import os
from fabric.api import env
from fabric.context_managers import cd
from fabric.contrib.project import rsync_project
from fabric.operations import run, sudo, put, local
from fabric.tasks import Task
from fabric.contrib.files import exists

from pawel.pawel import *
from chrigu.chrigu import *
from juno.juno import *


class BaseTask(Task):
    name = "base"

    def manage(self, command):
        with cd(env.remote_path()):
            run('python manage.py %s' % command)

    def collectstatic(self):
        self.manage('collectstatic --noinput')

    def apache_restart(self):
        sudo('apache2ctl restart')


class PrintTask(BaseTask):
    name = "print_env"

    def run(self):
        print 'Remote Dashboard:'
        print env.dashboard_config_path(env.dashboard_config_name)
        print 'Remote Settings:'
        print '%s/%s' % (env.remote_settings, 'local_settings.py')
        print 'Local Backend:'
        print env.local_backend
        print 'Remote Backend:'
        print env.remote_backend
        print 'Local Frontend:'
        print env.local_frontend
        print 'Remote Frontend:'
        print env.remote_frontend


print_task = PrintTask()


class Restart(BaseTask):
    name = "restart"

    def run(self):
        self.apache_restart()


restart_task = Restart()


class Reload(BaseTask):
    name = "reload"

    def run(self):
        self.collectstatic()
        self.apache_restart()


reload_task = Reload()


class DeploySettings(BaseTask):
    name = "deploy_settings"

    def run(self):
        # deploy settings
        print 'Deploying settings..'
        # rsync_project(
        #     remote_dir=env.remote_settings,
        #     local_dir=env.local_settings,
        #     exclude=env.rsync_exclude,
        #     extra_opts='--rsync-path="rsync"',
        # )
        # create remote backend dir
        if not exists(env.remote_backend):
            run('mkdir -p %s' % env.remote_backend)

        # deploy settings entry and rename as local_settings
        put('%s/%s' % (env.local_settings, env.settings_file), '%s/%s' % (env.remote_settings, 'local_settings.py'))
        # deploy dashboard config
        put('%s/%s' % (env.local_backend, env.dashboard_config_name), env.dashboard_config_path(env.dashboard_config_name))
        # restart apache
        restart_task.run()

deploy_settings_task = DeploySettings()


class Deploy(BaseTask):
    name = "deploy"

    def deploy_frontend(self, dry_run=False):
        local('grunt build')

        # rsync frontend
        print 'Rsyncing frontend: %s -> %s' % (env.local_frontend, env.remote_frontend)
        if not dry_run:
            # create remote backend dir
            if not exists(env.remote_frontend):
                run('mkdir -p %s' % env.remote_frontend)
            rsync_project(
                remote_dir=env.remote_frontend,
                local_dir=env.local_frontend,
                exclude=env.rsync_exclude,
                extra_opts='--rsync-path="rsync"',
            )

    def deploy_backend(self, dry_run=False):
        # rsync backend
        print 'Rsyncing backend:  %s -> %s' % (env.local_backend, env.remote_backend)
        if not dry_run:
            # create remote backend dir
            if not exists(env.remote_backend):
                run('mkdir -p %s' % env.remote_backend)
            rsync_project(
                remote_dir=env.remote_backend,
                local_dir=env.local_backend,
                exclude=env.rsync_exclude,
                extra_opts='--rsync-path="rsync"',
            )

    def run(self, dry_run=False):
        self.deploy_frontend(dry_run)
        self.deploy_backend(dry_run)

        # now reload after deployment
        if not dry_run:
            reload_task.run()

deploy_task = Deploy()


class DeployFrontend(Deploy):
    name = "deploy_front"

    def run(self, dry_run=False):
        self.deploy_frontend(dry_run)

        # now reload after deployment
        if not dry_run:
            reload_task.run()

deploy_front_task = DeployFrontend()