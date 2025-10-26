#!/bin/bash

# 减小 golang 编译出程序的体积
# http://blog.fatedier.com/2017/02/04/reduce-golang-program-size/
# CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags "-s -w" -o zhaopin main.go
# GOOS=linux GOARCH=amd64 go build -o zhaopin main.go
 CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags "-s -w" -o main_sece main.go

# nohup后台执行程序
# nohup /home/api/zhaopin  >> /home/api/output.log 2>&1 &
# nohup ./zhaopin  >> output.log 2>&1 &``