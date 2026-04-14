@echo off
setlocal

ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ExitOnForwardFailure=yes -T -R 80:127.0.0.1:5000 nokey@localhost.run 1> C:\personalassistant\.runtime\ssh-tunnel.out.log 2> C:\personalassistant\.runtime\ssh-tunnel.err.log
