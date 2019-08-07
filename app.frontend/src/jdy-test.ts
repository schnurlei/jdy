import * as JDY from './js/jdy/jdy-base';

export const testCreatePlantShopRepository = function (): JDY.JdyRepository {
    'use strict';
    let rep = new JDY.JdyRepository('PlantShop');

    let plantType = rep.addClassInfo('Plant', null);
    plantType.addTextAttr('BotanicName', 200).setIsKey(true).setNotNull(true);
    plantType.addLongAttr('HeigthInCm', 0, 5000);
    plantType.addTextAttr('PlantFamily', 100).setGenerated(true);
    plantType.addTextAttr('Color', 100, ['blue', 'red', 'green']);
    plantType.addBooleanAttr('wintergreen');
    plantType.addDecimalAttr('Price', 0.0, 200.0, 2);
    plantType.addTimeStampAttr('LastChanged', true, true);
    plantType.addVarCharAttr('Description', 1000);

    let orderItemType = rep.addClassInfo('OrderItem', null);
    orderItemType.addLongAttr('ItemNr', 0, 1000).setIsKey(true);
    orderItemType.addLongAttr('ItemCount', 0, 1000).setNotNull(true);
    orderItemType.addDecimalAttr('Price', 0.0000, 1000.0000, 4).setNotNull(true);
    orderItemType.addReference('Plant', plantType).setIsDependent(false).setNotNull(true);

    let bankAccountType = rep.addClassInfo('BankAccount', null);
    bankAccountType.addTextAttr('IBAN', 24).setIsKey(true);
    bankAccountType.addTextAttr('BIC', 11);
    bankAccountType.addTextAttr('Bank', 100);

    let addressType = rep.addClassInfo('Address', null);
    addressType.addTextAttr('AddressId', 30).setIsKey(true);
    addressType.addTextAttr('Street', 30).setNotNull(true);
    addressType.addTextAttr('ZipCode', 30).setNotNull(true);
    addressType.addTextAttr('City', 30).setNotNull(true);
    addressType.addEmailAttr('EMail', 30, null).setNotNull(true);

    let customerType = rep.addClassInfo('Customer', null);
    customerType.addTextAttr('CustomerId', 30).setIsKey(true);
    customerType.addTextAttr('FirstName', 30).setNotNull(true);
    customerType.addTextAttr('LastName', 30).setNotNull(true);
    customerType.addReference('PrivateAddress', addressType).setIsDependent(true).setNotNull(true);
    customerType.addReference('InvoiceAddress', addressType).setIsDependent(true).setNotNull(false);

    let orderType = rep.addClassInfo('PlantOrder', null);
    orderType.addLongAttr('OrderNr', 0, 999999999).setIsKey(true);
    orderType.addTimeStampAttr('OrderDate', true, false).setNotNull(true);

    rep.addAssociation('Items', orderType, orderItemType, 'Order', 'Order'
        , false, false, false);
    rep.addAssociation('Accounts', orderType, bankAccountType, 'Order', 'Order'
        , false, false, false);

    return rep;
};
