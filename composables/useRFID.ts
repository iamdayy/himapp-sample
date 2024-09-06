import { onMounted, onUnmounted, ref } from "vue";

export function useBluetooth() {
  const bluetoothData = ref<string | null>(null);
  const isConnected = ref(false);
  let bluetoothDevice: any = null; // Changed to 'any' to avoid type error
  let characteristic: any = null; // Changed to 'any' to avoid type error

  const connectBluetooth = async () => {
    try {
      bluetoothDevice = await navigator.bluetooth.requestDevice({
        // Sesuaikan dengan kebutuhan perangkat Bluetooth Anda
        acceptAllDevices: true,
      });

      const server = await bluetoothDevice.gatt?.connect();
      const service = await server?.getPrimaryService("battery_service");
      characteristic = await service?.getCharacteristic("battery_level");

      isConnected.value = true;
      startNotifications();
    } catch (error) {
      console.error("Koneksi Bluetooth gagal:", error);
    }
  };

  const startNotifications = () => {
    if (characteristic) {
      characteristic.startNotifications();
      characteristic.addEventListener(
        "characteristicvaluechanged",
        handleValueChange
      );
    }
  };

  const handleValueChange = (event: Event) => {
    const value = (event.target as any).value;
    if (value) {
      bluetoothData.value = new TextDecoder().decode(value);
    }
  };

  const disconnect = () => {
    if (bluetoothDevice && bluetoothDevice.gatt?.connected) {
      bluetoothDevice.gatt.disconnect();
    }
    isConnected.value = false;
    bluetoothData.value = null;
  };

  onMounted(() => {
    // Cek apakah browser mendukung Web Bluetooth API
    if (!navigator.bluetooth) {
      console.error("Web Bluetooth API tidak didukung di browser ini");
    }
  });

  onUnmounted(() => {
    disconnect();
  });

  return {
    bluetoothData,
    isConnected,
    connectBluetooth,
    disconnect,
  };
}
