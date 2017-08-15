//从udx node 转成 列 table data
function get_data_from_udx(_udxNode) {
    if (_udxNode === undefined) return undefined;

    var node_type = _udxNode.getKernel().getType();
    var node_value = _udxNode.getKernel().getTypedValue();
    var node_array_length = _udxNode.getKernel().getArrayCount();
    let Rslt = new Array();

    switch (node_type.value) {
        case Module.KernelType.EKT_INT.value:
            if (node_value !== undefined) {
                Rslt.push({
                    'x': node_value
                });
            } else {
                Rslt = undefined;
            }
            break;
        case Module.KernelType.EKT_REAL.value:
            if (node_value !== undefined) {
                Rslt.push({
                    'x': node_value
                });
            } else {
                Rslt = undefined;
            }
            break;

        case Module.KernelType.EKT_STRING.value:
            if (node_value !== undefined && node_value !== "") {
                Rslt.push({
                    'x': node_value
                });
            } else {
                Rslt = undefined;
            }
            break;
        case Module.KernelType.EKT_VECTOR2.value:
            if (node_value !== undefined && node_value.length === 2) {
                Rslt.push({
                    'x': node_value[0],
                    'y': node_value[1]
                });
            } else {
                Rslt = undefined;
            }
            break;
        case Module.KernelType.EKT_VECTOR3.value:
            if (node_value !== undefined && node_value.length === 3) {
                Rslt.push({
                    'x': node_value[0],
                    'y': node_value[1],
                    'z': node_value[2]
                });
            } else {
                Rslt = undefined;
            }
            break;
        case Module.KernelType.EKT_VECTOR4.value:
            if (node_value !== undefined && node_value.length === 4) {
                Rslt.push({
                    'x': node_value[0],
                    'y': node_value[1],
                    'z': node_value[2],
                    'v': node_value[3]
                });
            } else {
                Rslt = undefined;
            };
            break;
        case Module.KernelType.EKT_INT_LIST.value:
            if (node_array_length > 0) {
                for (var i = 0; i < node_array_length; i++) {
                    var current_node_value = _udxNode.getKernel().getTypedValueByIndex(i);
                    if (current_node_value !== undefined) {
                        Rslt.push({
                            'x': current_node_value
                        });
                    }
                }
            } else {
                Rslt = undefined;
            }
            break;
        case Module.KernelType.EKT_REAL_LIST.value:
            if (node_array_length > 0) {
                for (var i = 0; i < node_array_length; i++) {
                    var current_node_value = _udxNode.getKernel().getTypedValueByIndex(i);
                    if (current_node_value !== undefined) {
                        Rslt.push({
                            'x': current_node_value
                        });
                    }
                }
            } else {
                Rslt = undefined;
            }
            break;
        case Module.KernelType.EKT_STRING_LIST.value:
            if (node_array_length > 0) {
                for (var i = 0; i < node_array_length; i++) {
                    var current_node_value = _udxNode.getKernel().getTypedValueByIndex(i);
                    if (current_node_value !== undefined) {
                        Rslt.push({
                            'x': current_node_value
                        });
                    }
                }
            } else {
                Rslt = undefined;
            }
            break;
        case Module.KernelType.EKT_VECTOR2_LIST.value:
            if (node_array_length > 0) {
                for (var i = 0; i < node_array_length; i++) {
                    var current_node_value = _udxNode.getKernel().getTypedValueByIndex(i);
                    if (current_node_value !== undefined && current_node_value.length === 2) {
                        Rslt.push({
                            'x': current_node_value[0],
                            'y': current_node_value[1]
                        });
                    }
                }
            } else {
                Rslt = undefined;
            }
            break;
        case Module.KernelType.EKT_VECTOR3_LIST.value:
            if (node_array_length > 0) {
                for (var i = 0; i < node_array_length; i++) {
                    var current_node_value = _udxNode.getKernel().getTypedValueByIndex(i);
                    if (current_node_value !== undefined && current_node_value.length === 3) {
                        Rslt.push({
                            'x': current_node_value[0],
                            'y': current_node_value[1],
                            'z': current_node_value[2]

                        });
                    }
                }
            } else {
                Rslt = undefined;
            }
            break;
        case Module.KernelType.EKT_VECTOR4_LIST.value:
            if (node_array_length > 0) {
                for (var i = 0; i < node_array_length; i++) {
                    var current_node_value = _udxNode.getKernel().getTypedValueByIndex(i);
                    if (current_node_value !== undefined && current_node_value.length === 4) {
                        Rslt.push({
                            'x': current_node_value[0],
                            'y': current_node_value[1],
                            'z': current_node_value[2],
                            'v': current_node_value[3]

                        });
                    }
                }
            } else {
                Rslt = undefined;
            }
            break;

        default:
            Rslt = undefined;
            break;
    }
    return Rslt;

}

//从udx node 转成一行table data

function get_row_data_from_udx(_udxNode) {
    if (_udxNode === undefined) return undefined;

    var node_type = _udxNode.getKernel().getType();
    var node_value = _udxNode.getKernel().getTypedValue();
    var node_array_length = _udxNode.getKernel().getArrayCount();
    let Rslt = new Array();
    var current_node_value = "";

    switch (node_type.value) {
        case Module.KernelType.EKT_INT.value:
            if (node_value !== undefined) {
                Rslt.push({
                    'x': node_value
                });
            } else {
                Rslt = undefined;
            }
            break;
        case Module.KernelType.EKT_REAL.value:
            if (node_value !== undefined) {
                Rslt.push({
                    'x': node_value
                });
            } else {
                Rslt = undefined;
            }
            break;

        case Module.KernelType.EKT_STRING.value:
            if (node_value !== undefined && node_value !== "") {
                Rslt.push({
                    'x': node_value
                });
            } else {
                Rslt = undefined;
            }
            break;
        case Module.KernelType.EKT_VECTOR2.value:
            if (node_value !== undefined && node_value.length === 2) {
                Rslt.push({
                    'x': node_value[0] + "," + node_value[1]
                });
            } else {
                Rslt = undefined;
            }
            break;
        case Module.KernelType.EKT_VECTOR3.value:
            if (node_value !== undefined && node_value.length === 3) {
                Rslt.push({
                    'x': node_value[0] + "," + node_value[1] + "," + node_value[2]
                });
            } else {
                Rslt = undefined;
            }
            break;
        case Module.KernelType.EKT_VECTOR4.value:
            if (node_value !== undefined && node_value.length === 4) {
                Rslt.push({
                    'x': node_value[0] + "," + node_value[1] + "," + node_value[2] + "," + node_value[3]
                });
            } else {
                Rslt = undefined;
            };
            break;
        case Module.KernelType.EKT_INT_LIST.value:
            if (node_array_length > 0) {            
                for (var i = 0; i < node_array_length; i++) {
                   current_node_value += _udxNode.getKernel().getTypedValueByIndex(i);
                   if(i!==node_array_length-1){
                       current_node_value+=","
                   }
                }
                if (current_node_value !== "") {
                    Rslt.push({
                        'x': current_node_value
                    });
                }
            } else {
                Rslt = undefined;
            }
            break;
        case Module.KernelType.EKT_REAL_LIST.value:
            if (node_array_length > 0) {
                 for (var i = 0; i < node_array_length; i++) {
                   current_node_value += _udxNode.getKernel().getTypedValueByIndex(i);
                   if(i!==node_array_length-1){
                       current_node_value+=","
                   }
                }
                if (current_node_value !== "") {
                    Rslt.push({
                        'x': current_node_value
                    });
                }
            } else {
                Rslt = undefined;
            }
            break;
        case Module.KernelType.EKT_STRING_LIST.value:
            if (node_array_length > 0) {
                for (var i = 0; i < node_array_length; i++) {
                   current_node_value += _udxNode.getKernel().getTypedValueByIndex(i);
                   if(i!==node_array_length-1){
                       current_node_value+=","
                   }
                }
                if (current_node_value !== "") {
                    Rslt.push({
                        'x': current_node_value
                    });
                }
            } else {
                Rslt = undefined;
            }
            break;
        default:
            Rslt = undefined;
            break;
    }
    return Rslt;
}

//从表的data update 到一个udx node 中
function update_udx_from_data(_udxNode, _table_data) {
    if (_udxNode === undefined) return undefined;

    var node_type = _udxNode.getKernel().getType();

    switch (node_type.value) {
        case Module.KernelType.EKT_INT.value:
            if (_table_data !== undefined && _table_data.length === 1) {
                var current_value = _table_data[0]['x'];
                if (isNaN(Number(current_value))) {
                    return false;
                }
                _udxNode.getKernel().setTypedValue(parseInt(current_value));
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_REAL.value:
            if (_table_data !== undefined && _table_data.length === 1) {
                var current_value = _table_data[0]['x'];
                if (isNaN(Number(current_value))) {
                    return false;
                }
                _udxNode.getKernel().setTypedValue(current_value * 1);
            } else {
                return false;
            }
            break;

        case Module.KernelType.EKT_STRING.value:
            if (_table_data !== undefined && _table_data.length === 1) {
                var current_value = _table_data[0]['x'];
                _udxNode.getKernel().setTypedValue(current_value);
            } else {
                return false;
            }
            break;

        case Module.KernelType.EKT_VECTOR2.value:
            if (_table_data !== undefined && _table_data.length >= 0) {
                if (_table_data[0]['x'] !== undefined &&
                    _table_data[0]['y'] !== undefined) {

                    if (isNaN(Number(_table_data[0]['x'])) ||
                        isNaN(Number(_table_data[0]['y']))) {
                        return false;
                    }
                    _udxNode.getKernel().setTypedValue(new Vector2d(
                        Number(_table_data[0]['x']),
                        Number(_table_data[0]['y'])));
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_VECTOR3.value:
            if (_table_data !== undefined && _table_data.length >= 0) {

                if (_table_data[0]['x'] !== undefined &&
                    _table_data[0]['y'] !== undefined &&
                    _table_data[0]['z'] !== undefined) {

                    if (isNaN(Number(_table_data[0]['x'])) ||
                        isNaN(Number(_table_data[0]['y'])) ||
                        isNaN(Number(_table_data[0]['z']))) {
                        return false;
                    }

                    var update_data = new Vector3d(
                        Number(_table_data[0]['x']),
                        Number(_table_data[0]['y']),
                        Number(_table_data[0]['z']));
                    _udxNode.getKernel().setTypedValue(update_data);
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_VECTOR4.value:
            if (_table_data !== undefined && _table_data.length >= 0) {

                if (_table_data[0]['x'] !== undefined &&
                    _table_data[0]['y'] !== undefined &&
                    _table_data[0]['z'] !== undefined &&
                    _table_data[0]['v'] !== undefined) {

                    if (isNaN(Number(_table_data[0]['x'])) ||
                        isNaN(Number(_table_data[0]['y'])) ||
                        isNaN(Number(_table_data[0]['z'])) ||
                        isNaN(Number(_table_data[0]['v']))) {
                        return false;
                    }
                    _udxNode.getKernel().setTypedValue(new Vector4d(
                        Number(_table_data[0]['x']),
                        Number(_table_data[0]['y']),
                        Number(_table_data[0]['z']),
                        Number(_table_data[0]['v'])));
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_INT_LIST.value:
            if (_table_data !== undefined && _table_data.length >= 1) {
                _udxNode.getKernel().clearArray();
                for (var i = 0; i < _table_data.length; i++) {
                    if (_table_data[i]['x'] !== undefined) {

                        if (isNaN(Number(_table_data[i]['x']))) {
                            return false;
                        }
                        _udxNode.getKernel().addTypedValue(
                            parseInt(Number(_table_data[i]['x'])));
                    }
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_REAL_LIST.value:
            if (_table_data !== undefined && _table_data.length >= 1) {
                _udxNode.getKernel().clearArray();
                for (var i = 0; i < _table_data.length; i++) {
                    if (_table_data[i]['x'] !== undefined) {

                        if (isNaN(Number(_table_data[i]['x']))) {
                            return false;
                        }
                        _udxNode.getKernel().addTypedValue(
                            Number(_table_data[i]['x']) * 1);
                    }
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_STRING_LIST.value:
            _udxNode.getKernel().clearArray();
            if (_table_data !== undefined && _table_data.length >= 1) {
                for (var i = 0; i < _table_data.length; i++) {
                    if (_table_data[i]['x'] !== undefined) {
                        _udxNode.getKernel().addTypedValue(
                            _table_data[i]['x']);
                    }
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_VECTOR2_LIST.value:
            if (_table_data !== undefined && _table_data.length >= 1) {
                _udxNode.getKernel().clearArray();
                for (var i = 0; i < _table_data.length; i++) {
                    if (_table_data[i]['x'] !== undefined &&
                        _table_data[i]['y'] !== undefined) {

                        if (isNaN(Number(_table_data[i]['x'])) ||
                            isNaN(Number(_table_data[i]['y']))) {
                            return false;
                        }
                        _udxNode.getKernel().addTypedValue(new Vector2d(
                            Number(_table_data[i]['x']),
                            Number(_table_data[i]['y'])));
                    }
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_VECTOR3_LIST.value:
            if (_table_data !== undefined && _table_data.length >= 1) {
                _udxNode.getKernel().clearArray();
                for (var i = 0; i < _table_data.length; i++) {
                    if (_table_data[i]['x'] !== undefined &&
                        _table_data[i]['y'] !== undefined &&
                        _table_data[i]['z'] !== undefined) {

                        if (isNaN(Number(_table_data[i]['x'])) ||
                            isNaN(Number(_table_data[i]['y'])) ||
                            isNaN(Number(_table_data[i]['z']))) {
                            return false;
                        }
                        _udxNode.getKernel().addTypedValue(new Vector3d(
                            Number(_table_data[i]['x']),
                            Number(_table_data[i]['y']),
                            Number(_table_data[i]['z'])));
                    }
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_VECTOR4_LIST.value:
            _udxNode.getKernel().clearArray();
            if (_table_data !== undefined && _table_data.length >= 1) {
                for (var i = 0; i < _table_data.length; i++) {
                    if (_table_data[i]['x'] !== undefined &&
                        _table_data[i]['y'] !== undefined &&
                        _table_data[i]['z'] !== undefined &&
                        _table_data[i]['v'] !== undefined) {

                        if (isNaN(Number(_table_data[i]['x'])) ||
                            isNaN(Number(_table_data[i]['y'])) ||
                            isNaN(Number(_table_data[i]['z'])) ||
                            isNaN(Number(_table_data[i]['v']))) {
                            return false;
                        }
                        _udxNode.getKernel().addTypedValue(new Vector4d(
                            Number(_table_data[i]['x']),
                            Number(_table_data[i]['y']),
                            Number(_table_data[i]['z']),
                            Number(_table_data[i]['v'])));
                    }
                }
            } else {
                return false;
            }
            break;

        default:
            Rslt = undefined;
            break;
    }
    return true;;
}

//show table column
function showColumn($_table, _columns_count) {
    if ($_table != undefined) {
        var m_columns = $_table.bootstrapTable('getOptions')['columns'][0];
        $_table.show();
        hideAllColumns($_table, m_columns);
        if (_columns_count > 0 && _columns_count <= m_columns.length) {
            for (var i = 0; i < _columns_count; i++) {
                $_table.bootstrapTable('showColumn', m_columns[i]['field']);
            }
        }
    }

    function hideAllColumns($_table, _columns) {
        if ($_table != undefined && _columns !== undefined) {
            for (var j = 0; j < _columns.length; j++) {
                $_table.bootstrapTable('hideColumn', _columns[j]['field']);
            }
        }
    }

}

//get select row
function get_select_row(_table_id) {
    var rslt = undefined;
    $('#' + _table_id + ' tbody tr').each(function () {
        if ($(this).hasClass('m_active')) {
            rslt = parseInt($(this)[0]['dataset']['index']);
            return false;
        }
    })
    return rslt;
}

function check_data(node_type, _table_data) {
    if (node_type === undefined) return undefined;
    switch (node_type.value) {
        case Module.KernelType.EKT_INT.value:
            if (_table_data !== undefined && _table_data.length === 1) {
                var current_value = _table_data[0]['x'];
                if (isNaN(Number(current_value))) {
                    return false;
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_REAL.value:
            if (_table_data !== undefined && _table_data.length === 1) {
                var current_value = _table_data[0]['x'];
                if (isNaN(Number(current_value))) {
                    return false;
                }
            } else {
                return false;
            }
            break;

        case Module.KernelType.EKT_STRING.value:
            if (_table_data !== undefined && _table_data.length === 1) {
                var current_value = _table_data[0]['x'];
                if (current_value === "") {
                    return false;
                }

            } else {
                return false;
            }
            break;

        case Module.KernelType.EKT_VECTOR2.value:
            if (_table_data !== undefined && _table_data.length >= 0) {
                if (_table_data[0]['x'] !== undefined &&
                    _table_data[0]['y'] !== undefined) {

                    if (isNaN(Number(_table_data[0]['x'])) ||
                        isNaN(Number(_table_data[0]['y']))) {
                        return false;
                    }
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_VECTOR3.value:
            if (_table_data !== undefined && _table_data.length >= 0) {

                if (_table_data[0]['x'] !== undefined &&
                    _table_data[0]['y'] !== undefined &&
                    _table_data[0]['z'] !== undefined) {

                    if (isNaN(Number(_table_data[0]['x'])) ||
                        isNaN(Number(_table_data[0]['y'])) ||
                        isNaN(Number(_table_data[0]['z']))) {
                        return false;
                    }

                    var update_data = new Vector3d(
                        Number(_table_data[0]['x']),
                        Number(_table_data[0]['y']),
                        Number(_table_data[0]['z']));
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_VECTOR4.value:
            if (_table_data !== undefined && _table_data.length >= 0) {

                if (_table_data[0]['x'] !== undefined &&
                    _table_data[0]['y'] !== undefined &&
                    _table_data[0]['z'] !== undefined &&
                    _table_data[0]['v'] !== undefined) {

                    if (isNaN(Number(_table_data[0]['x'])) ||
                        isNaN(Number(_table_data[0]['y'])) ||
                        isNaN(Number(_table_data[0]['z'])) ||
                        isNaN(Number(_table_data[0]['v']))) {
                        return false;
                    }
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_INT_LIST.value:
            if (_table_data !== undefined && _table_data.length >= 1) {
                for (var i = 0; i < _table_data.length; i++) {
                    if (_table_data[i]['x'] !== undefined) {

                        if (isNaN(Number(_table_data[i]['x']))) {
                            return false;
                        }
                    }
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_REAL_LIST.value:
            if (_table_data !== undefined && _table_data.length >= 1) {
                for (var i = 0; i < _table_data.length; i++) {
                    if (_table_data[i]['x'] !== undefined) {

                        if (isNaN(Number(_table_data[i]['x']))) {
                            return false;
                        }
                    }
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_STRING_LIST.value:
            if (_table_data !== undefined && _table_data.length >= 1) {
                for (var i = 0; i < _table_data.length; i++) {
                    if (_table_data[i]['x'] !== undefined) {
                        if (_table_data[i]['x'] === "") {
                            return false;
                        }
                    }
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_VECTOR2_LIST.value:
            if (_table_data !== undefined && _table_data.length >= 1) {
                for (var i = 0; i < _table_data.length; i++) {
                    if (_table_data[i]['x'] !== undefined &&
                        _table_data[i]['y'] !== undefined) {

                        if (isNaN(Number(_table_data[i]['x'])) ||
                            isNaN(Number(_table_data[i]['y']))) {
                            return false;
                        }
                    }
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_VECTOR3_LIST.value:
            if (_table_data !== undefined && _table_data.length >= 1) {
                for (var i = 0; i < _table_data.length; i++) {
                    if (_table_data[i]['x'] !== undefined &&
                        _table_data[i]['y'] !== undefined &&
                        _table_data[i]['z'] !== undefined) {

                        if (isNaN(Number(_table_data[i]['x'])) ||
                            isNaN(Number(_table_data[i]['y'])) ||
                            isNaN(Number(_table_data[i]['z']))) {
                            return false;
                        }
                    }
                }
            } else {
                return false;
            }
            break;
        case Module.KernelType.EKT_VECTOR4_LIST.value:
            if (_table_data !== undefined && _table_data.length >= 1) {
                for (var i = 0; i < _table_data.length; i++) {
                    if (_table_data[i]['x'] !== undefined &&
                        _table_data[i]['y'] !== undefined &&
                        _table_data[i]['z'] !== undefined &&
                        _table_data[i]['v'] !== undefined) {

                        if (isNaN(Number(_table_data[i]['x'])) ||
                            isNaN(Number(_table_data[i]['y'])) ||
                            isNaN(Number(_table_data[i]['z'])) ||
                            isNaN(Number(_table_data[i]['v']))) {
                            return false;
                        }
                    }
                }
            } else {
                return false;
            }
            break;

        default:
            return false;
            break;
    }
    return true;;
}
