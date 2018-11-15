//Format for returned Object
var retObj = {
	scoped_apps : {
		count : 0,
		apps : {}
	},
	u_tables:{
		count : 0,
		extended_count : 0,
		tables : [],
		extended_tables : {}
	},
	global_apps : {
		count : 0,
		apps : {}
	}
};
getScopedTables(true);
getUTables(true);
gs.print(JSON.stringify(retObj,null,2));

function getScopedTables(excludeImportTableExtension){
	var appGR = new GlideRecord("sys_app");
	appGR.query();

	while(appGR.next()){
		var appID = appGR.sys_id.toString();
		var appName = appGR.getDisplayValue();
		var appInfo = {
			tables : [],
			extended_tables : {},
			table_count : 0,
			table_extension_count : 0
		};
		var appScope = "scoped_apps";
		var tableGR = new GlideRecord("sys_db_object");
		tableGR.addQuery("sys_scope",appID);
		if(excludeImportTableExtension){
			tableGR.addQuery("super_class.name","!=","sys_import_set_row");
		}
		tableGR.query();

		appInfo.table_count = tableGR.getRowCount();
		while(tableGR.next()){
			var tableName = tableGR.name.toString();
			//var containsU = tableName.indexOf("u_");
			if(tableGR.sys_scope.scope.toString() === "global"){
				appScope = "global_apps";
			}
			if(!tableGR.super_class.nil()){
				var extendName = tableGR.super_class.name.toString();
				if(appInfo.extended_tables[extendName]){
					appInfo.extended_tables[extendName].count++;
					appInfo.extended_tables[extendName].tables.push(tableName);
				}else{
					appInfo.extended_tables[extendName] = {
						count : 1,
						tables : [tableName]
					};
				}
				appInfo.table_extension_count++;
			}
			appInfo.tables.push(tableName);
		}
		retObj[appScope].apps[appName] = appInfo;
		retObj[appScope].count++;
	}
}

function getUTables( excludeImportTableExtension ){
	var uTableGR = new GlideRecord("sys_db_object");
	uTableGR.addQuery("name","STARTSWITH","u_");
	if(excludeImportTableExtension){
		uTableGR.addQuery("super_class.name","!=","sys_import_set_row");
	}
	uTableGR.query();

	while(uTableGR.next()){
		var tableName = uTableGR.name.toString();
		if(uTableGR.sys_scope.scope.toString() === "global"){
			if(!uTableGR.super_class.nil()){
				var extendName = uTableGR.super_class.name.toString();
				if(retObj.u_tables.extended_tables[extendName]){
					retObj.u_tables.extended_tables[extendName].count++;
					retObj.u_tables.extended_tables[extendName].tables.push(tableName);
				}else{
					retObj.u_tables.extended_tables[extendName] = {
						count : 1,
						tables : [tableName]
					};
				}
				retObj.u_tables.extended_count++;
			}
			retObj.u_tables.count++;
			retObj.u_tables.tables.push(tableName);
		}
	}
}
