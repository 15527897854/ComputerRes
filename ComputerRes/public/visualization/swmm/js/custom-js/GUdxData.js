var EKernelType = {
	EKT_NULL: Module.KernelType.EKT_NULL,
	EKT_INT: Module.KernelType.EKT_INT,
	EKT_REAL: Module.KernelType.EKT_REAL,
	EKT_STRING: Module.KernelType.EKT_STRING,
	EKT_VECTOR2: Module.KernelType.EKT_VECTOR2,
	EKT_VECTOR3: Module.KernelType.EKT_VECTOR3,
	EKT_VECTOR4: Module.KernelType.EKT_VECTOR4,
	EKT_INT_LIST: Module.KernelType.EKT_INT_LIST,
	EKT_REAL_LIST: Module.KernelType.EKT_REAL_LIST,
	EKT_STRING_LIST: Module.KernelType.EKT_STRING_LIST,
	EKT_VECTOR2_LIST: Module.KernelType.EKT_VECTOR2_LIST,
	EKT_VECTOR3_LIST: Module.KernelType.EKT_VECTOR3_LIST,
	EKT_VECTOR4_LIST: Module.KernelType.EKT_VECTOR4_LIST,
	EKT_NODE: Module.KernelType.EKT_NODE,
	EKT_LIST: Module.KernelType.EKT_LIST,
	EKT_MAP: Module.KernelType.EKT_MAP,
	EKT_TABLE: Module.KernelType.EKT_TABLE
};

function Vector2d(_x, _y) {
	this.x = _x;
	this.y = _y;
}
function Vector3d(_x, _y, _z) {
	this.x = _x;
	this.y = _y;
	this.z = _z;
}
function Vector4d(_x, _y, _z, _m) {
	this.x = _x;
	this.y = _y;
	this.z = _z;
	this.m = _m;
}

function UdxKernel(pType, pNode) {
	this.mType = pType;
	this.mNode = pNode;

	this.getNode = function () {
		return this.mNode;
	};

	this.getType = function () {
		return this.mType;
	};

	this.getArrayCount = function () {
		if (this.mType == EKernelType.EKT_INT_LIST) {
			return Module.getNodeIntArrayCount(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_REAL_LIST) {
			return Module.getNodeRealArrayCount(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_STRING_LIST) {
			return Module.getNodeStringArrayCount(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_VECTOR2_LIST) {
			return Module.getNodeVector2dArrayCount(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_VECTOR3_LIST) {
			return Module.getNodeVector3dArrayCount(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_VECTOR4_LIST) {
			return Module.getNodeVector4dArrayCount(this.mNode.getNativeObj());
		}
		return 1;
	};

	this.clearArray = function () {
		if (this.mType == EKernelType.EKT_INT_LIST ||
			this.mType == EKernelType.EKT_REAL_LIST ||
			this.mType == EKernelType.EKT_STRING_LIST ||
			this.mType == EKernelType.EKT_VECTOR2_LIST ||
			this.mType == EKernelType.EKT_VECTOR3_LIST ||
			this.mType == EKernelType.EKT_VECTOR4_LIST) {
			return Module.clearNodeArray(this.mNode.getNativeObj());
		}
		else {
			return false;
		}
	};

	this.removeArrayItemByIndex = function (idx) {
		if (this.mType == EKernelType.EKT_INT_LIST) {
			return Module.removeIntNodeArrayValueByIdx(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_REAL_LIST) {
			return Module.removeRealNodeArrayValueByIdx(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_STRING_LIST) {
			return Module.removeStringNodeArrayValueByIdx(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR2_LIST) {
			return Module.removeVector2dNodeArrayValueByIdx(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR3_LIST) {
			return Module.removeVector3dNodeArrayValueByIdx(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR4_LIST) {
			return Module.removeVector4dNodeArrayValueByIdx(this.mNode.getNativeObj(), idx);
		}
		return false;
	};

	this.getTypedValue = function () {
		if (this.mType == EKernelType.EKT_INT) {
			return Module.getNodeIntValue(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_REAL) {
			return Module.getNodeRealValue(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_STRING) {
			return Module.getNodeStringValue(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_VECTOR2) {
			return Module.getNodeVector2dValue(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_VECTOR3) {
			return Module.getNodeVector3dValue(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_VECTOR4) {
			return Module.getNodeVector4dValue(this.mNode.getNativeObj());
		}
	};

	this.getTypedValueByIndex = function (idx) {
		if (this.mType == EKernelType.EKT_INT_LIST) {
			return Module.getNodeIntArrayValue(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_REAL_LIST) {
			return Module.getNodeRealArrayValue(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_STRING_LIST) {
			return Module.getNodeStringArrayValue(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR2_LIST) {
			return Module.getNodeVector2dArrayValue(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR3_LIST) {
			return Module.getNodeVector3dArrayValue(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR4_LIST) {
			return Module.getNodeVector4dArrayValue(this.mNode.getNativeObj(), idx);
		}
	};

	this.setTypedValue = function (val) {
		if (this.mType == EKernelType.EKT_INT) {
			Module.setIntNodeValue(this.mNode.getNativeObj(), val);
		}
		else if (this.mType == EKernelType.EKT_REAL) {
			Module.setRealNodeValue(this.mNode.getNativeObj(), val);
		}
		else if (this.mType == EKernelType.EKT_STRING) {
			Module.setStringNodeValue(this.mNode.getNativeObj(), val);
		}
		else if (this.mType == EKernelType.EKT_VECTOR2) {
			Module.setVector2dNodeValue(this.mNode.getNativeObj(), val.x, val.y);
		}
		else if (this.mType == EKernelType.EKT_VECTOR3) {
			Module.setVector3dNodeValue(this.mNode.getNativeObj(), val.x, val.y, val.z);
		}
		else if (this.mType == EKernelType.EKT_VECTOR4) {
			Module.setVector4dNodeValue(this.mNode.getNativeObj(), val.x, val.y, val.z, val.m);
		}
	};

	this.addTypedValue = function (val) {
		var idx = this.getArrayCount();
		if (this.mType == EKernelType.EKT_INT_LIST) {
			Module.addIntNodeValue(this.mNode.getNativeObj(), val, idx);
		}
		else if (this.mType == EKernelType.EKT_REAL_LIST) {
			Module.addRealNodeValue(this.mNode.getNativeObj(), val, idx);
		}
		else if (this.mType == EKernelType.EKT_STRING_LIST) {
			Module.addStringNodeValue(this.mNode.getNativeObj(), val, idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR2_LIST) {
			Module.addVector2dNodeValue(this.mNode.getNativeObj(), val.x, val.y, idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR3_LIST) {
			Module.addVector3dNodeValue(this.mNode.getNativeObj(), val.x, val.y, val.z, idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR4_LIST) {
			Module.addVector4dNodeValue(this.mNode.getNativeObj(), val.x, val.y, val.z, val.m, idx);
		}
	};

	this.setTypedValueByIndex = function (val, idx) {
		if (this.mType == EKernelType.EKT_INT_LIST) {
			Module.addIntNodeValue(this.mNode.getNativeObj(), val, idx);
		}
		else if (this.mType == EKernelType.EKT_REAL_LIST) {
			Module.addRealNodeValue(this.mNode.getNativeObj(), val, idx);
		}
		else if (this.mType == EKernelType.EKT_STRING_LIST) {
			Module.addStringNodeValue(this.mNode.getNativeObj(), val, idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR2_LIST) {
			Module.addVector2dNodeValue(this.mNode.getNativeObj(), val.x, val.y, idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR3_LIST) {
			Module.addVector3dNodeValue(this.mNode.getNativeObj(), val.x, val.y, val.z, idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR4_LIST) {
			Module.addVector4dNodeValue(this.mNode.getNativeObj(), val.x, val.y, val.z, val.m, idx);
		}
	}
}

function UdxNode(pParentNode) {
	this.mParentNode = pParentNode;

	this.create = function (pName, pType) {
		this.nativeObj = Module.addChildNode(pParentNode.getNativeObj(), pName, pType);
		this.kernel = new UdxKernel(pType, this);
	}

	this.getNativeObj = function () {
		return this.nativeObj;
	};

	this.getParentNode = function () {
		return this.mParentNode;
	};

	this.getName = function () {
		return Module.getNodeName(this.nativeObj);
	};

	this.setName = function (name) {
		Module.setNodeName(this.nativeObj, name);
	};

	this.getKernel = function () {
		return this.kernel;
	};

	this.getChildNodeCount = function () {
		return Module.getNodeChildCount(this.nativeObj);
	};

	this.getChildNode = function (idx) {
		var count = this.getChildNodeCount();
		if (idx < 0 || idx >= count)
			return undefined;
		var node_native_obj = Module.getChildNode(this.nativeObj, idx);
		var pType = Module.getNodeType(node_native_obj);
		var pUdxNode = new UdxNode(this);
		pUdxNode.nativeObj = node_native_obj;
		pUdxNode.kernel = new UdxKernel(pType, pUdxNode);
		return pUdxNode;
	};

	this.addChildNode = function (name, type) {
		var childNode = new UdxNode(this);
		childNode.create(name, type);
		if (childNode.nativeObj == 0) return undefined;
		return childNode;
	};

	this.removeChildNode = function (node) {
		if (node == undefined) return false;
		if (node.nativeObj == 0) return false;
		var retVal = Module.removeChildNode(this.nativeObj, node.nativeObj);
		return retVal;
	};

	this.removeChildNodeByIndex = function (idx) {
		var retVal = Module.removeChildNodeByIndex(this.nativeObj, idx);
		return retVal;
	};
};

function UdxDataset() {
	this.createDataset = function () {
		this.dataset = Module.createUdxDataset();
		this.nativeObj = Module.getDatasetNode(this.dataset);
		this.kernel = new UdxKernel(EKernelType.EKT_NODE, this);
	};

	this.getDatasetObj = function () {
		return this.dataset;
	};

	this.formatToXmlStream = function () {
		var xml_str = Module.formatToXmlStream(this.dataset);
		return xml_str;
	};

	this.loadFromXmlStream = function (xml_str) {
		Module.loadFromXmlStream(this.dataset, xml_str);
	};

	this.destroyDataset = function () {
		Module.releaseDataset(this.dataset);
		this.dataset = 0;
		this.nativeObj = 0;
		this.kernel = undefined;
	};
}

UdxDataset.prototype = new UdxNode();

/**custom method start */
function string2UDXDataType(_TypeStr) {
	let Rslt = undefined;
	switch (_TypeStr) {
		case 'EKT_INT': Rslt = Module.KernelType.EKT_INT; break;
		case 'EKT_REAL': Rslt = Module.KernelType.EKT_REAL; break;
		case 'EKT_VECTOR2': Rslt = Module.KernelType.EKT_VECTOR2; break;
		case 'EKT_VECTOR3': Rslt = Module.KernelType.EKT_VECTOR3; break;
		case 'EKT_VECTOR4': Rslt = Module.KernelType.EKT_VECTOR4; break;
		case 'EKT_STRING': Rslt = Module.KernelType.EKT_STRING; break;
		case 'EKT_INT_LIST': Rslt = Module.KernelType.EKT_INT_LIST; break;
		case 'EKT_REAL_LIST': Rslt = Module.KernelType.EKT_REAL_LIST; break;
		case 'EKT_VECTOR2_LIST': Rslt = Module.KernelType.EKT_VECTOR2_LIST; break;
		case 'EKT_VECTOR3_LIST': Rslt = Module.KernelType.EKT_VECTOR3_LIST; break;
		case 'EKT_VECTOR4_LIST': Rslt = Module.KernelType.EKT_VECTOR4_LIST; break;
		case 'EKT_STRING_LIST': Rslt = Module.KernelType.EKT_STRING_LIST; break;
		case 'EKT_NODE': Rslt = Module.KernelType.EKT_NODE; break;
		case 'EKT_LIST': Rslt = Module.KernelType.EKT_LIST; break;
		case 'EKT_MAP': Rslt = Module.KernelType.EKT_MAP; break;
		case 'EKT_TABLE': Rslt = Module.KernelType.EKT_TABLE; break;
		default:
			break;
	}
	return Rslt;
}
function UDXDataType2String(_Type) {
	let RsltStr = "";
	switch (_Type.value) {
		case Module.KernelType.EKT_INT.value: RsltStr = 'EKT_INT'; break;
		case Module.KernelType.EKT_REAL.value: RsltStr = 'EKT_REAL'; break;
		case Module.KernelType.EKT_VECTOR2.value: RsltStr = 'EKT_VECTOR2'; break;
		case Module.KernelType.EKT_VECTOR3.value: RsltStr = 'EKT_VECTOR3'; break;
		case Module.KernelType.EKT_VECTOR4.value: RsltStr = 'EKT_VECTOR4'; break;
		case Module.KernelType.EKT_STRING.value: RsltStr = 'EKT_STRING'; break;
		case Module.KernelType.EKT_INT_LIST.value: RsltStr = 'EKT_INT_LIST'; break;
		case Module.KernelType.EKT_REAL_LIST.value: RsltStr = 'EKT_REAL_LIST'; break;
		case Module.KernelType.EKT_VECTOR2_LIST.value: RsltStr = 'EKT_VECTOR2_LIST'; break;
		case Module.KernelType.EKT_VECTOR3_LIST.value: RsltStr = 'EKT_VECTOR3_LIST'; break;
		case Module.KernelType.EKT_VECTOR4_LIST.value: RsltStr = 'EKT_VECTOR4_LIST'; break;
		case Module.KernelType.EKT_STRING_LIST.value: RsltStr = 'EKT_STRING_LIST'; break;
		case Module.KernelType.EKT_NODE.value: RsltStr = 'EKT_NODE'; break;
		case Module.KernelType.EKT_LIST.value: RsltStr = 'EKT_LIST'; break;
		case Module.KernelType.EKT_MAP.value: RsltStr = 'EKT_MAP'; break;
		case Module.KernelType.EKT_TABLE.value: RsltStr = 'EKT_TABLE'; break;
		default:
			break;
	}
	return RsltStr;
}

function getNodeValueColumns(_Type) {
	let Rslt = 0;
	switch (_Type.value) {
		case Module.KernelType.EKT_INT.value: Rslt = 1; break;
		case Module.KernelType.EKT_REAL.value: Rslt = 1; break;
		case Module.KernelType.EKT_VECTOR2.value: Rslt = 2; break;
		case Module.KernelType.EKT_VECTOR3.value: Rslt = 3; break;
		case Module.KernelType.EKT_VECTOR4.value: Rslt = 4; break;
		case Module.KernelType.EKT_STRING.value: Rslt = 1; break;
		case Module.KernelType.EKT_INT_LIST.value: Rslt = 1; break;
		case Module.KernelType.EKT_REAL_LIST.value: Rslt = 1; break;
		case Module.KernelType.EKT_VECTOR2_LIST.value: Rslt = 2; break;
		case Module.KernelType.EKT_VECTOR3_LIST.value: Rslt = 3; break;
		case Module.KernelType.EKT_VECTOR4_LIST.value: Rslt = 4; break;
		case Module.KernelType.EKT_STRING_LIST.value: Rslt = 1; break;
		case Module.KernelType.EKT_NODE.value: Rslt = 0; break;
		case Module.KernelType.EKT_LIST.value: Rslt = 0; break;
		case Module.KernelType.EKT_MAP.value: Rslt = 0; break;
		case Module.KernelType.EKT_TABLE.value: Rslt = 0; break;
		default:
			Rslt = 0;
			break;
	}
	return Rslt;
}

//can add rows? 
function getNodeMaxRows(_Type) {
	let Rslt = 0;
	switch (_Type.value) {
		case Module.KernelType.EKT_INT.value: Rslt = 1; break;
		case Module.KernelType.EKT_REAL.value: Rslt = 1; break;
		case Module.KernelType.EKT_VECTOR2.value: Rslt = 1; break;
		case Module.KernelType.EKT_VECTOR3.value: Rslt = 1; break;
		case Module.KernelType.EKT_VECTOR4.value: Rslt = 1; break;
		case Module.KernelType.EKT_STRING.value: Rslt = 1; break;
		case Module.KernelType.EKT_INT_LIST.value: Rslt = 2; break;
		case Module.KernelType.EKT_REAL_LIST.value: Rslt = 2; break;
		case Module.KernelType.EKT_VECTOR2_LIST.value: Rslt = 2; break;
		case Module.KernelType.EKT_VECTOR3_LIST.value: Rslt = 2; break;
		case Module.KernelType.EKT_VECTOR4_LIST.value: Rslt = 2; break;
		case Module.KernelType.EKT_STRING_LIST.value: Rslt = 2; break;
		case Module.KernelType.EKT_NODE.value: Rslt = 0; break;
		case Module.KernelType.EKT_LIST.value: Rslt = 0; break;
		case Module.KernelType.EKT_MAP.value: Rslt = 0; break;
		case Module.KernelType.EKT_TABLE.value: Rslt = 0; break;
		default:
			Rslt = 0;
			break;
	}
	return Rslt;
}
/**custom method end */

function testUdxData() {
	var dataset = new UdxDataset();
	dataset.createDataset();
	var node1 = dataset.addChildNode("Node1", EKernelType.EKT_INT);
	var node2 = dataset.addChildNode("Node2", EKernelType.EKT_REAL);
	var node3 = dataset.addChildNode("Node3", EKernelType.EKT_STRING);
	var node4 = dataset.addChildNode("Node4", EKernelType.EKT_VECTOR2);
	var node5 = dataset.addChildNode("Node5", EKernelType.EKT_VECTOR3);
	var node6 = dataset.addChildNode("Node6", EKernelType.EKT_VECTOR4);

	var node7 = dataset.addChildNode("Node7", EKernelType.EKT_NODE);
	var node7_1 = node7.addChildNode("node7_1", EKernelType.EKT_INT_LIST);
	var node7_2 = node7.addChildNode("node7_2", EKernelType.EKT_REAL_LIST);
	var node7_3 = node7.addChildNode("node7_3", EKernelType.EKT_STRING_LIST);
	var node7_4 = node7.addChildNode("node7_4", EKernelType.EKT_VECTOR2_LIST);
	var node7_5 = node7.addChildNode("node7_5", EKernelType.EKT_VECTOR3_LIST);
	var node7_6 = node7.addChildNode("node7_6", EKernelType.EKT_VECTOR4_LIST);

	node1.getKernel().setTypedValue(10);
	node2.getKernel().setTypedValue(10.23);
	node3.getKernel().setTypedValue("dfafad");
	node4.getKernel().setTypedValue(new Vector2d(12.23, 98.87));
	node5.getKernel().setTypedValue(new Vector3d(12.23, 98.87, 45.56));
	node6.getKernel().setTypedValue(new Vector4d(12.23, 98.87, 45.56, 34.78));

	node7_1.getKernel().addTypedValue(1);
	node7_1.getKernel().addTypedValue(2);
	node7_1.getKernel().addTypedValue(3);

	node7_2.getKernel().addTypedValue(1.2);
	node7_2.getKernel().addTypedValue(2.3);
	node7_2.getKernel().addTypedValue(3.4);

	node7_3.getKernel().addTypedValue("GRASS");
	node7_3.getKernel().addTypedValue("CCSDF");
	node7_3.getKernel().addTypedValue("BUILDING");

	node7_4.getKernel().addTypedValue(new Vector2d(9.8, 0.87));
	node7_4.getKernel().addTypedValue(new Vector2d(7.6, 0.65));
	node7_4.getKernel().addTypedValue(new Vector2d(5.4, 0.43));

	node7_5.getKernel().addTypedValue(new Vector3d(9.8, 0.87, 34.87));
	node7_5.getKernel().addTypedValue(new Vector3d(7.6, 0.65, 45.65));
	node7_5.getKernel().addTypedValue(new Vector3d(5.4, 0.43, 56.43));

	node7_6.getKernel().addTypedValue(new Vector4d(9.8, 0.87, 34.87, 4.387));
	node7_6.getKernel().addTypedValue(new Vector4d(7.6, 0.65, 45.65, 5.465));
	node7_6.getKernel().addTypedValue(new Vector4d(5.4, 0.43, 56.43, 6.543));

	node7_5.getKernel().clearArray();
	node7_5.getKernel().addTypedValue(new Vector3d(5.4, 0.43, 56.43));
	node7_5.getKernel().addTypedValue(new Vector3d(7.6, 0.65, 45.65));
	node7_5.getKernel().addTypedValue(new Vector3d(9.8, 0.87, 34.87));

	node7_5.getKernel().removeArrayItemByIndex(1);

	var xml_str = dataset.formatToXmlStream();
	console.log(xml_str);

	node7_4.getKernel().setTypedValueByIndex(new Vector2d(100, 200), 1);
	node7_5.getKernel().setTypedValueByIndex(new Vector3d(100, 200, 300), 1);
	xml_str = dataset.formatToXmlStream();
	console.log(xml_str);

	var temp_node0 = dataset.getChildNode(0);
	var node_name0 = temp_node0.getName();
	console.log(node_name0);
	var node_type0 = temp_node0.getKernel().getType();
	console.log(node_type0);

	temp_node0.getKernel().setTypedValue(43);
	xml_str = dataset.formatToXmlStream();
	console.log(xml_str);

	////////////////////////////////////////////////////
	var dataset1 = new UdxDataset();
	dataset1.createDataset();
	dataset1.loadFromXmlStream(xml_str);

	var temp_node1 = dataset1.getChildNode(0);
	var node_name = temp_node1.getName();
	console.log(node_name);
	var node_type = temp_node1.getKernel().getType();
	console.log(node_type);

	temp_node1.getKernel().setTypedValue(98);

	dataset1.getChildNode(6).getChildNode(0).getParentNode().removeChildNodeByIndex(1);
	dataset1.removeChildNode(dataset1.getChildNode(2));

	xml_str = dataset1.formatToXmlStream();
	console.log(xml_str);

	dataset1.destroyDataset();
	var xml_str2 = dataset1.formatToXmlStream();
	console.log(xml_str2);

	dataset1.createDataset();
	dataset1.loadFromXmlStream(xml_str);
	var xml_str3 = dataset1.formatToXmlStream();
	console.log(xml_str3);
}


