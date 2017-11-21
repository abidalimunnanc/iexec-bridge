DOCKERHOST=$1
DOCKERHOST_IP=$(netstat -nr | grep '^0\.0\.0\.0' | awk '{print $2}')
echo -e "$DOCKERHOST_IP\t${DOCKERHOST}" >> /etc/hosts
cat /etc/hosts
