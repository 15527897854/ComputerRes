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

function Vector2d(_x, _y){
	this.x = _x;
	this.y = _y;
}
function Vector3d(_x, _y, _z){
	this.x = _x;
	this.y = _y;
	this.z = _z;
}
function Vector4d(_x, _y, _z, _m){
	this.x = _x;
	this.y = _y;
	this.z = _z;
	this.m = _m;
}

function UdxKernel(pType, pNode){
	this.mType = pType;
	this.mNode = pNode;
	
	this.getNode=function(){
		return this.mNode;
	};
	
	this.getType=function(){
		return this.mType;
	};
	
	this.getArrayCount=function(){
		if (this.mType == EKernelType.EKT_INT_LIST){
			return Module.getNodeIntArrayCount(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_REAL_LIST){
			return Module.getNodeRealArrayCount(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_STRING_LIST){
			return Module.getNodeStringArrayCount(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_VECTOR2_LIST){
			return Module.getNodeVector2dArrayCount(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_VECTOR3_LIST){
			return Module.getNodeVector3dArrayCount(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_VECTOR4_LIST){
			return Module.getNodeVector4dArrayCount(this.mNode.getNativeObj());
		}
		return 1;
	};
	
	this.clearArray=function(){
		if (this.mType == EKernelType.EKT_INT_LIST || 
			this.mType == EKernelType.EKT_REAL_LIST || 
			this.mType == EKernelType.EKT_STRING_LIST || 
			this.mType == EKernelType.EKT_VECTOR2_LIST || 
			this.mType == EKernelType.EKT_VECTOR3_LIST ||
			this.mType == EKernelType.EKT_VECTOR4_LIST)
		{					
			return Module.clearNodeArray(this.mNode.getNativeObj());
		}
		else
		{
			return false;
		}
	};
	
	this.removeArrayItemByIndex=function(idx){
		if (this.mType == EKernelType.EKT_INT_LIST){
			return Module.removeIntNodeArrayValueByIdx(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_REAL_LIST){
			return Module.removeRealNodeArrayValueByIdx(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_STRING_LIST){
			return Module.removeStringNodeArrayValueByIdx(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR2_LIST){
			return Module.removeVector2dNodeArrayValueByIdx(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR3_LIST){
			return Module.removeVector3dNodeArrayValueByIdx(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR4_LIST){
			return Module.removeVector4dNodeArrayValueByIdx(this.mNode.getNativeObj(), idx);
		}
		return false;
	};
	
	this.getTypedValue=function(){
		if (this.mType == EKernelType.EKT_INT){
			return Module.getNodeIntValue(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_REAL){
			return Module.getNodeRealValue(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_STRING){
			return Module.getNodeStringValue(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_VECTOR2){
			return Module.getNodeVector2dValue(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_VECTOR3){
			return Module.getNodeVector3dValue(this.mNode.getNativeObj());
		}
		else if (this.mType == EKernelType.EKT_VECTOR4){
			return Module.getNodeVector4dValue(this.mNode.getNativeObj());
		}
	};
	
	this.getTypedValueByIndex=function(idx){
		if (this.mType == EKernelType.EKT_INT_LIST){
			return Module.getNodeIntArrayValue(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_REAL_LIST){
			return Module.getNodeRealArrayValue(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_STRING_LIST){
			return Module.getNodeStringArrayValue(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR2_LIST){
			return Module.getNodeVector2dArrayValue(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR3_LIST){
			return Module.getNodeVector3dArrayValue(this.mNode.getNativeObj(), idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR4_LIST){
			return Module.getNodeVector4dArrayValue(this.mNode.getNativeObj(), idx);
		}
	};
	
	this.setTypedValue=function(val){
		if (this.mType == EKernelType.EKT_INT){
			Module.setIntNodeValue(this.mNode.getNativeObj(), val);
		}
		else if (this.mType == EKernelType.EKT_REAL){
			Module.setRealNodeValue(this.mNode.getNativeObj(), val);
		}
		else if (this.mType == EKernelType.EKT_STRING){
			Module.setStringNodeValue(this.mNode.getNativeObj(), val);
		}
		else if (this.mType == EKernelType.EKT_VECTOR2){
			Module.setVector2dNodeValue(this.mNode.getNativeObj(), val.x, val.y);
		}
		else if (this.mType == EKernelType.EKT_VECTOR3){
			Module.setVector3dNodeValue(this.mNode.getNativeObj(), val.x, val.y, val.z);
		}
		else if (this.mType == EKernelType.EKT_VECTOR4){
			Module.setVector4dNodeValue(this.mNode.getNativeObj(), val.x, val.y, val.z, val.m);
		}
	};
	
	this.addTypedValue=function(val){
		var idx = this.getArrayCount();
		if (this.mType == EKernelType.EKT_INT_LIST){
			Module.addIntNodeValue(this.mNode.getNativeObj(), val, idx);
		}
		else if (this.mType == EKernelType.EKT_REAL_LIST){
			Module.addRealNodeValue(this.mNode.getNativeObj(), val, idx);
		}
		else if (this.mType == EKernelType.EKT_STRING_LIST){
			Module.addStringNodeValue(this.mNode.getNativeObj(), val, idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR2_LIST){
			Module.addVector2dNodeValue(this.mNode.getNativeObj(), val.x, val.y, idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR3_LIST){
			Module.addVector3dNodeValue(this.mNode.getNativeObj(), val.x, val.y, val.z, idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR4_LIST){
			Module.addVector4dNodeValue(this.mNode.getNativeObj(), val.x, val.y, val.z, val.m, idx);
		}
	};
	
	this.setTypedValueByIndex=function(val, idx){
		if (this.mType == EKernelType.EKT_INT_LIST){
			Module.addIntNodeValue(this.mNode.getNativeObj(), val, idx);
		}
		else if (this.mType == EKernelType.EKT_REAL_LIST){
			Module.addRealNodeValue(this.mNode.getNativeObj(), val, idx);
		}
		else if (this.mType == EKernelType.EKT_STRING_LIST){
			Module.addStringNodeValue(this.mNode.getNativeObj(), val, idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR2_LIST){
			Module.addVector2dNodeValue(this.mNode.getNativeObj(), val.x, val.y, idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR3_LIST){
			Module.addVector3dNodeValue(this.mNode.getNativeObj(), val.x, val.y, val.z, idx);
		}
		else if (this.mType == EKernelType.EKT_VECTOR4_LIST){
			Module.addVector4dNodeValue(this.mNode.getNativeObj(), val.x, val.y, val.z, val.m, idx);
		}
	}
}

function UdxNode(pParentNode){
	this.mParentNode = pParentNode;
	
	this.create=function(pName, pType){
		this.nativeObj = Module.addChildNode(pParentNode.getNativeObj(), pName, pType);
		this.kernel = new UdxKernel(pType, this);
	}
	
	
	this.getNativeObj=function(){
		return this.nativeObj;
	};
	
	this.getParentNode=function(){
		return this.mParentNode;
	};
	
	this.getName=function(){
		return Module.getNodeName(this.nativeObj);
	};
	
	this.setName=function(name){
		Module.setNodeName(this.nativeObj, name);
	};
	
	this.getKernel=function(){
		return this.kernel;
	};
				
	this.getChildNodeCount=function(){
		return Module.getNodeChildCount(this.nativeObj);
	};
	
	this.getChildNode=function(idx){
		var count = this.getChildNodeCount();
		if (idx<0 || idx >= count)
			return undefined;
		var node_native_obj = Module.getChildNode(this.nativeObj,idx);
		var pType = Module.getNodeType(node_native_obj);
		var pUdxNode = new UdxNode(this);
		pUdxNode.nativeObj = node_native_obj;
		pUdxNode.kernel = new UdxKernel(pType, pUdxNode);
		return pUdxNode;
	};
	
	this.addChildNode=function(name, type){
		var childNode = new UdxNode(this);
		childNode.create(name, type);
		if (childNode.nativeObj==0) return undefined;
		return childNode;
	};
	
	this.removeChildNode=function(node){
		if (node == undefined) return false;
		if (node.nativeObj == 0) return false;
		var retVal = Module.removeChildNode(this.nativeObj, node.nativeObj);
		if (retVal == 0) return true;
		return false;
	};
	
	this.removeChildNodeByIndex=function(idx){
		var retVal = Module.removeChildNodeByIndex(this.nativeObj, idx);
		if (retVal == 0) return true;
		return false;
	};
};

function UdxDataset(){		
	this.createDataset=function(){
		this.dataset = Module.createUdxDataset();
		this.nativeObj = Module.getDatasetNode(this.dataset);
		this.kernel = new UdxKernel(EKernelType.EKT_NODE, this);
	};
	
	this.getDatasetObj=function(){
		return this.dataset;
	};
	
	this.formatToXmlStream=function(){
		var xml_str = Module.formatToXmlStream(this.dataset);
		return xml_str;
	};
	
	this.loadFromXmlStream=function(xml_str){
		Module.loadFromXmlStream(this.dataset, xml_str);
	};
	
	this.destroyDataset=function(){
		Module.releaseDataset(this.dataset);
		this.dataset = 0;
		this.nativeObj = 0;
		this.kernel = undefined;
	};
}

UdxDataset.prototype = new UdxNode();	
