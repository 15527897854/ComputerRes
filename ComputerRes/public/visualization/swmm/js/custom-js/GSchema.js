var ESchemaNodeType = {
	EDTKT_INT: Module.SchemaNodeType.EDTKT_INT,
	EDTKT_REAL: Module.SchemaNodeType.EDTKT_REAL,
	EDTKT_VECTOR2: Module.SchemaNodeType.EDTKT_VECTOR2,
	EDTKT_VECTOR3: Module.SchemaNodeType.EDTKT_VECTOR3,
	EDTKT_VECTOR4: Module.SchemaNodeType.EDTKT_VECTOR4,
	EDTKT_STRING: Module.SchemaNodeType.EDTKT_STRING,
	EDTKT_INT_LIST: Module.SchemaNodeType.EDTKT_INT_LIST,
	EDTKT_REAL_LIST: Module.SchemaNodeType.EDTKT_REAL_LIST,
	EDTKT_VECTOR2_LIST: Module.SchemaNodeType.EDTKT_VECTOR2_LIST,
	EDTKT_VECTOR3_LIST: Module.SchemaNodeType.EDTKT_VECTOR3_LIST,
	EDTKT_VECTOR4_LIST: Module.SchemaNodeType.EDTKT_VECTOR4_LIST,
	EDTKT_STRING_LIST: Module.SchemaNodeType.EDTKT_STRING_LIST,
	EDTKT_NODE: Module.SchemaNodeType.EDTKT_NODE,
	EDTKT_LIST: Module.SchemaNodeType.EDTKT_LIST,
	EDTKT_MAP: Module.SchemaNodeType.EDTKT_MAP,
	EDTKT_TABLE: Module.SchemaNodeType.EDTKT_TABLE
};

function UdxNodeDescription(pNode) {
	this.ownNode = pNode;

	this.getNodeDescription = function () {
		var description = Module.getSchemaNodeDescription(this.ownNode.getNativeObj()); //节点描述信息
		return description;
	};

	this.getNodeConceptInfo = function () {
		var conceptTag = Module.getSchemaNodeConceptInfo(this.ownNode.getNativeObj());
		return conceptTag;
	};

	this.getNodeSpatialRefInfo = function () {
		var spatialTag = Module.getSchemaNodeSpatialRefInfo(this.ownNode.getNativeObj());
		return spatialTag;
	};

	this.getNodeUnitInfo = function () {
		var unitTag = Module.getSchemaNodeUnitInfo(this.ownNode.getNativeObj());
		return unitTag;
	};

	this.getNodeDataTemplateInfo = function () {
		var dataTemplateTag = Module.getSchemaNodeDataTemplateInfo(this.ownNode.getNativeObj());
		return dataTemplateTag;
	};

	this.modifyNodeDescription = function (descriptionInfo) {
		Module.modifySchemaNodeDescription(this.ownNode.getNativeObj(), descriptionInfo); //修改节点描述信息
	};

	this.modifyNodeConceptInfo = function (conceptTag) {
		Module.modifySchemaNodeConceptInfo(this.ownNode.getNativeObj(), conceptTag); //修改节点描述信息
	};

	this.modifyNodeSpatialRefInfo = function (spatialTag) {
		Module.modifySchemaNodeSpatialRefInfo(this.ownNode.getNativeObj(), spatialTag); //修改节点描述信息
	};

	this.modifyNodeUnitInfo = function (unitTag) {
		Module.modifySchemaNodeUnitInfo(this.ownNode.getNativeObj(), unitTag); //修改节点描述信息
	};

	this.modifyNodeDataTemplateInfo = function (dataTemplateTag) {
		Module.modifySchemaNodeDataTemplateInfo(this.ownNode.getNativeObj(), dataTemplateTag); //修改节点描述信息
	};
}

function UdxSchemaNode(pParentNode) {
	this.parentNode = pParentNode;

	this.create = function (name, type, description) {
		this.nativeObj = Module.addSchemaChildNode(this.parentNode.getNativeObj(), name, type, description);
		this.description = new UdxNodeDescription(this);
	};

	this.getNativeObj = function () {
		return this.nativeObj;
	};

	this.getParentNode = function () {
		return this.parentNode;
	};

	this.getDescription = function () {
		return this.description;
	};

	this.getNodeName = function () {
		var name = Module.getSchemaNodeName(this.nativeObj); //节点名称
		return name;
	};

	this.setNodeName = function (name) {
		Module.modifySchemaNodeName(this.nativeObj, name); //修改节点名称
	};

	this.getNodeType = function () {
		var nodeType = Module.getSchemaNodeType(this.nativeObj); //节点类型
		return nodeType;
	};

	this.addChildNode = function (name, type, description) {
		var cNode = new UdxSchemaNode(this);
		cNode.create(name, type, description);
		if (cNode.getNativeObj() == 0) return undefined;
		return cNode;
	};

	this.getChildNodeCount = function () {
		return Module.getSchemaNodeChildCount(this.nativeObj);
	};

	this.getChildNode = function (idx) {
		var count = this.getChildNodeCount();
		if (idx < 0 || idx >= count)
			return undefined;
		var node_native_obj = Module.getSchemaChildNode(this.nativeObj, idx);
		var node = new UdxSchemaNode(this);
		node.nativeObj = node_native_obj;
		node.description = new UdxNodeDescription(node);
		return node;
	};

	this.removeChildNode = function (node) {
		if (node == undefined) return false;
		if (node.nativeObj == 0) return false;
		var retVal = Module.removeSchemaChildNode(this.nativeObj, node.nativeObj);
		if (retVal == 0) return true;
		return false;
	};

	this.removeChildNodeByIndex = function (idx) {
		var retVal = Module.removeSchemaChildNodeByIndex(this.nativeObj, idx);
		if (retVal == 0) return true;
		return false;
	};
};

function UdxSchemaDataset() {
	this.createDataset = function () {
		this.dataset = Module.createUdxDatasetSchema(); //创建一个Dataset
		this.nativeObj = Module.getSchemaRootNode(this.dataset); //获取Dataset的根节点
		this.description = new UdxNodeDescription(this);
	};

	this.createDatasetWithPointer = function (datasetObj) {
		this.dataset = datasetObj;
		this.nativeObj = Module.getSchemaRootNode(this.dataset);
		this.description = new UdxNodeDescription(this);
	};

	this.getDatasetObj = function () {
		return this.dataset;
	};

	this.formatToXmlStream = function () {
		var xml_str = Module.formatSchemaToXmlStream(this.dataset);
		return xml_str;
	};

	this.loadFromXmlStream = function (xml_str) {
		return Module.loadSchemaFromXmlStream(this.dataset, xml_str);
	};

	this.destroyDataset = function () {
		Module.releaseUdxDatasetSchema(this.dataset);
		this.dataset = 0;
		this.nativeObj = 0;
		this.kernel = undefined;
	};
};

UdxSchemaDataset.prototype = new UdxSchemaNode();

function string2UDXSchemaType(_TypeStr) {
	let Rslt = undefined;
	switch (_TypeStr) {
		case 'EDTKT_INT': Rslt = Module.SchemaNodeType.EDTKT_INT; break;
		case 'EDTKT_REAL': Rslt = Module.SchemaNodeType.EDTKT_REAL; break;
		case 'EDTKT_VECTOR2': Rslt = Module.SchemaNodeType.EDTKT_VECTOR2; break;
		case 'EDTKT_VECTOR3': Rslt = Module.SchemaNodeType.EDTKT_VECTOR3; break;
		case 'EDTKT_VECTOR4': Rslt = Module.SchemaNodeType.EDTKT_VECTOR4; break;
		case 'EDTKT_STRING': Rslt = Module.SchemaNodeType.EDTKT_STRING; break;
		case 'EDTKT_INT_LIST': Rslt = Module.SchemaNodeType.EDTKT_INT_LIST; break;
		case 'EDTKT_REAL_LIST': Rslt = Module.SchemaNodeType.EDTKT_REAL_LIST; break;
		case 'EDTKT_VECTOR2_LIST': Rslt = Module.SchemaNodeType.EDTKT_VECTOR2_LIST; break;
		case 'EDTKT_VECTOR3_LIST': Rslt = Module.SchemaNodeType.EDTKT_VECTOR3_LIST; break;
		case 'EDTKT_VECTOR4_LIST': Rslt = Module.SchemaNodeType.EDTKT_VECTOR4_LIST; break;
		case 'EDTKT_STRING_LIST': Rslt = Module.SchemaNodeType.EDTKT_STRING_LIST; break;
		case 'EDTKT_NODE': Rslt = Module.SchemaNodeType.EDTKT_NODE; break;
		case 'EDTKT_LIST': Rslt = Module.SchemaNodeType.EDTKT_LIST; break;
		case 'EDTKT_MAP': Rslt = Module.SchemaNodeType.EDTKT_MAP; break;
		case 'EDTKT_TABLE': Rslt = Module.SchemaNodeType.EDTKT_TABLE; break;
		default:
			break;
	}
	return Rslt;
}
function UDXSchemaType2String(_Type) {
	let RsltStr = "";
	switch (_Type) {
		case Module.SchemaNodeType.EDTKT_INT: RsltStr = 'EDTKT_INT'; break;
		case Module.SchemaNodeType.EDTKT_REAL: RsltStr = 'EDTKT_REAL'; break;
		case Module.SchemaNodeType.EDTKT_VECTOR2: RsltStr = 'EDTKT_VECTOR2'; break;
		case Module.SchemaNodeType.EDTKT_VECTOR3: RsltStr = 'EDTKT_VECTOR3'; break;
		case Module.SchemaNodeType.EDTKT_VECTOR4: RsltStr = 'EDTKT_VECTOR4'; break;
		case Module.SchemaNodeType.EDTKT_STRING: RsltStr = 'EDTKT_STRING'; break;
		case Module.SchemaNodeType.EDTKT_INT_LIST: RsltStr = 'EDTKT_INT_LIST'; break;
		case Module.SchemaNodeType.EDTKT_REAL_LIST: RsltStr = 'EDTKT_REAL_LIST'; break;
		case Module.SchemaNodeType.EDTKT_VECTOR2_LIST: RsltStr = 'EDTKT_VECTOR2_LIST'; break;
		case Module.SchemaNodeType.EDTKT_VECTOR3_LIST: RsltStr = 'EDTKT_VECTOR3_LIST'; break;
		case Module.SchemaNodeType.EDTKT_VECTOR4_LIST: RsltStr = 'EDTKT_VECTOR4_LIST'; break;
		case Module.SchemaNodeType.EDTKT_STRING_LIST: RsltStr = 'EDTKT_STRING_LIST'; break;
		case Module.SchemaNodeType.EDTKT_NODE: RsltStr = 'EDTKT_NODE'; break;
		case Module.SchemaNodeType.EDTKT_LIST: RsltStr = 'EDTKT_LIST'; break;
		case Module.SchemaNodeType.EDTKT_MAP: RsltStr = 'EDTKT_MAP'; break;
		case Module.SchemaNodeType.EDTKT_TABLE: RsltStr = 'EDTKT_TABLE'; break;
		default:
			break;
	}
	return RsltStr;

}

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

function testUdxSchema() {
	var dataset = new UdxSchemaDataset();
	dataset.createDataset();
	var node1 = dataset.addChildNode("name1", ESchemaNodeType.EDTKT_NODE, "description1");
	var node1_1 = node1.addChildNode("name1_1", ESchemaNodeType.EDTKT_INT, "description1_1");
	var node1_2 = node1.addChildNode("name1_2", ESchemaNodeType.EDTKT_REAL, "description1_2");
	var xml_str = dataset.formatToXmlStream();
	console.log(xml_str);

	var dataset1 = new UdxSchemaDataset();
	dataset1.createDataset();
	dataset1.loadFromXmlStream(xml_str);
	var n1 = dataset1.getChildNode(0);
	n1.getDescription().modifyNodeConceptInfo("{8337A049-E9B5-4129-8716-7EC9785E56D1}");
	n1.getDescription().modifyNodeDescription("new description");

	var n2 = n1.getChildNode(1);
	n2.getDescription().modifyNodeConceptInfo("{11C35DE5-3678-4C2B-9C03-C0B45353BDC2}");
	n2.getDescription().modifyNodeDescription("gaga new description");

	var xml_str1 = dataset1.formatToXmlStream();
	console.log(xml_str1);

	n1.removeChildNodeByIndex(0);
	xml_str1 = dataset1.formatToXmlStream();
	console.log(xml_str1);

	dataset1.destroyDataset();
	dataset1.loadFromXmlStream(xml_str1);
	var xml_str12 = dataset1.formatToXmlStream();
	console.log(xml_str12);
}
