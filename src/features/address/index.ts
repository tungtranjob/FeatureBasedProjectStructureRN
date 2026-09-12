/** PUBLIC API của feature address. */
export {AddressPickerScreen} from './screens/AddressPickerScreen';
export {ADDRESS_ROUTES} from './navigation/address.routes';
export type {AddressStackParamList} from './navigation/address.routes';
export {useDeliveryAddress} from './hooks/use-delivery-address';
export {formatFullAddress} from './model/types';
export type {DeliveryAddress} from './model/types';

import {useSelectedAddressStore} from './store/selected-address.store';

/** Reset lựa chọn khi đăng xuất (gọi từ app/bootstrap). */
export const resetSelectedAddress = (): void =>
  useSelectedAddressStore.getState().reset();
