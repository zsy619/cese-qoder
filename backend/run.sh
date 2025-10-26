#!/bin/sh

case $1 in 
	start)
		nohup ./main_sece 2>&1 >> /home/sece/backend/logs/log.log 2>&1 /dev/null &
		echo "服务已启动..."
		sleep 1
	;;
	stop)
		killall main_sece
		echo "服务已停止..."
		sleep 1
	;;
	restart)
		killall main_sece
		sleep 1
		nohup ./main_sece 2>&1 >> /home/sece/backend/logs/log.log 2>&1 /dev/null &
		echo "服务已重启..."
		sleep 1
	;;
	*) 
		echo "$0 {start|stop|restart}"
		exit 4
	;;
esac