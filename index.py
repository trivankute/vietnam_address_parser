from vnaddress import VNAddressStandardizer

address = VNAddressStandardizer(raw_address = "thcs tung thien vuong phuong 12 quan 8 tphcm", comma_handle = True, detail=True)
address.execute()