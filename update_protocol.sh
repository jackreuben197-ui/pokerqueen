#! /bin/bash

repo_url=https://gitlab.com/darkalliance/agreement-web.git
repo_dir=agreement-web
holdem_pb_dir=${repo_dir}/holdem/pb
cowboy_pb_dir=${repo_dir}/cowboy/pb
holdem_cs_dir=protobuf/Holdem
cowboy_cs_dir=protobuf/Cowboy

function main {
    if [ ! -d $repo_dir ]; then
        echo "# there's no ${repo_dir} repository, trying to git clone it..."
        if git clone ${repo_url} ${repo_dir}
        then
            echo "# clone repository to ${repo_dir}."
        else
            echo "# error: cannot clone ${repo_url}."
            return 1
        fi
    fi

    if [ ! -d $holdem_cs_dir ]; then
        if mkdir -p ${holdem_cs_dir}
        then
            echo "# created output directory: '${holdem_cs_dir}'."
        else
            echo "# error: cannot create output directory: '${holdem_cs_dir}'."
            return 1
        fi
    fi

    if [ ! -d $cowboy_cs_dir ]; then
        if mkdir -p ${cowboy_cs_dir}
        then
            echo "# created output directory: '${cowboy_cs_dir}'."
        else
            echo "# error: cannot create output directory: '${cowboy_cs_dir}'."
            return 1
        fi
    fi

    update_protocol
}

function update_protocol {
    if cd $repo_dir
    then
        set_git_conf
    else
        echo "# error: cannot enter ${repo_dir}."
        return 1
    fi

    if git pull origin
    then
        echo "# updated repository."
    else
        echo "# error: cannot pull origin."
        return 1
    fi

    cd ..

    if [ -d $holdem_pb_dir ]; then
        copy_files $holdem_pb_dir $holdem_cs_dir
    fi

    if [ -d $cowboy_pb_dir ]; then
        copy_files $cowboy_pb_dir $cowboy_cs_dir
    fi
}

function set_git_conf {
    git config --local credential.helper store
    #git config --local core.autocrlf true
}

function copy_files {
    src=$1
    dst=$2

    if [ ! -d $src ]; then
        echo "# error: copy_files: source directory '${src}' not exist."
        return 1
    fi

    if [ ! -d $dst ]; then
        echo "# error: copy_files: destination directory '${dst}' not exist."
        return 1
    fi

    if cp ${src}/*.js ${dst}/
    then
        echo "# copy ${src}/*.js to ${dst}."
        return 0
    else
        echo "# error: cannot copy ${src}/*.js to ${dst}."
        return 1
    fi
}

main
