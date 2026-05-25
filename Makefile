include $(TOPDIR)/rules.mk

PKG_NAME          := luci-app-nexttrace
PKG_VERSION       := 0.1.2
PKG_RELEASE       := 1
PKG_URL           := https://github.com/httSlayQueen/luci-app-nexttrace
PKG_MAINTAINER    := HTT <morgana314@qq.com>
PKG_LICENSE       := MIT license
PKG_LICENSE_FILES := LICENSE

PKG_BUILD_DEPENDS := nexttrace

LUCI_TITLE         := LuCI Support for nexttrace
LUCI_DEPENDS       := +luci-compat
LUCI_PKGARCH       := all

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature