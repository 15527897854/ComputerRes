# 模型服务容器

# Bug日志

SWAT集成出错：第一步输出的WaterShadeShape要求是Polygon，如果输出为xml格式，算出来的数据有岛，不完成，导致后面的模型运行失败。但如果输出为zip就会成功。