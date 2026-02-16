from __future__ import annotations

import logging
from typing import Any

from proxmoxer import ProxmoxAPI
from requests.exceptions import RequestException

from app.config import settings

logger = logging.getLogger(__name__)


class ProxmoxClient:
    """Wrapper around the Proxmox API for safe, cached access."""

    def __init__(self) -> None:
        self._api: ProxmoxAPI | None = None

    def _connect(self) -> ProxmoxAPI:
        """Create a new connection to the Proxmox API."""
        try:
            api = ProxmoxAPI(
                settings.proxmox_host,
                port=settings.proxmox_port,
                user=settings.proxmox_user,
                token_name=settings.proxmox_token_name,
                token_value=settings.proxmox_token_value,
                verify_ssl=settings.proxmox_verify_ssl,
                backend="https",
            )
            logger.info("Connected to Proxmox at %s:%s", settings.proxmox_host, settings.proxmox_port)
            return api
        except Exception:
            logger.exception("Failed to connect to Proxmox")
            raise

    @property
    def api(self) -> ProxmoxAPI:
        """Get or create the Proxmox API connection."""
        if self._api is None:
            self._api = self._connect()
        return self._api

    def get_nodes(self) -> list[dict[str, Any]]:
        """Retrieve all nodes from the Proxmox cluster."""
        try:
            return self.api.nodes.get()
        except RequestException:
            logger.exception("Failed to fetch nodes from Proxmox")
            return []

    def get_node_status(self, node_name: str) -> dict[str, Any]:
        """Retrieve detailed status for a specific node."""
        try:
            return self.api.nodes(node_name).status.get()
        except RequestException:
            logger.exception("Failed to fetch status for node %s", node_name)
            return {}

    def get_vms(self, node_name: str) -> list[dict[str, Any]]:
        """Retrieve all QEMU VMs on a node."""
        try:
            return self.api.nodes(node_name).qemu.get()
        except RequestException:
            logger.exception("Failed to fetch VMs for node %s", node_name)
            return []

    def get_containers(self, node_name: str) -> list[dict[str, Any]]:
        """Retrieve all LXC containers on a node."""
        try:
            return self.api.nodes(node_name).lxc.get()
        except RequestException:
            logger.exception("Failed to fetch containers for node %s", node_name)
            return []

    def get_vm_status(self, node_name: str, vmid: int) -> dict[str, Any]:
        """Retrieve current status for a specific VM."""
        try:
            return self.api.nodes(node_name).qemu(vmid).status.current.get()
        except RequestException:
            logger.exception("Failed to fetch status for VM %s on %s", vmid, node_name)
            return {}

    def get_vm_config(self, node_name: str, vmid: int) -> dict[str, Any]:
        """Retrieve configuration for a specific VM."""
        try:
            return self.api.nodes(node_name).qemu(vmid).config.get()
        except RequestException:
            logger.exception("Failed to fetch config for VM %s on %s", vmid, node_name)
            return {}

    def start_vm(self, node_name: str, vmid: int) -> str | None:
        """Start a VM. Returns the task UPID or None on failure."""
        try:
            result = self.api.nodes(node_name).qemu(vmid).status.start.post()
            logger.info("Started VM %s on %s", vmid, node_name)
            return result
        except RequestException:
            logger.exception("Failed to start VM %s on %s", vmid, node_name)
            return None

    def stop_vm(self, node_name: str, vmid: int) -> str | None:
        """Stop a VM. Returns the task UPID or None on failure."""
        try:
            result = self.api.nodes(node_name).qemu(vmid).status.stop.post()
            logger.info("Stopped VM %s on %s", vmid, node_name)
            return result
        except RequestException:
            logger.exception("Failed to stop VM %s on %s", vmid, node_name)
            return None

    def restart_vm(self, node_name: str, vmid: int) -> str | None:
        """Restart a VM via reboot. Returns the task UPID or None on failure."""
        try:
            result = self.api.nodes(node_name).qemu(vmid).status.reboot.post()
            logger.info("Restarted VM %s on %s", vmid, node_name)
            return result
        except RequestException:
            logger.exception("Failed to restart VM %s on %s", vmid, node_name)
            return None


proxmox_client = ProxmoxClient()
