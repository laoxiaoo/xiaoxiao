使用etcdctlv3的版本时，需设置环境变量ETCDCTL_API=3。

export ETCDCTL_API=3

或者在`/etc/profile`文件中添加环境变量

```shell
vi /etc/profile
...
ETCDCTL_API=3
...
source /etc/profile
```



如果出现如下错误

```tex
$ go get go.etcd.io/etcd/clientv3
# github.com/coreos/etcd/clientv3/balancer/resolver/endpoint
..\..\..\pkg\mod\github.com\coreos\etcd@v3.3.26+incompatible\clientv3\balancer\resolver\endpoint\endpoint.go:114:78: undefined: resolver.BuildOption
..\..\..\pkg\mod\github.com\coreos\etcd@v3.3.26+incompatible\clientv3\balancer\resolver\endpoint\endpoint.go:182:31: undefined: resolver.ResolveNowOption
# github.com/coreos/etcd/clientv3/balancer/picker
..\..\..\pkg\mod\github.com\coreos\etcd@v3.3.26+incompatible\clientv3\balancer\picker\err.go:37:44: undefined: balancer.PickOptions
..\..\..\pkg\mod\github.com\coreos\etcd@v3.3.26+incompatible\clientv3\balancer\picker\roundrobin_balanced.go:55:54: undefined: balancer.PickOptions

```

是因为grpc的问题

直接修改版本

```shell
go mod edit -require=google.golang.org/grpc@v1.26.0
```

