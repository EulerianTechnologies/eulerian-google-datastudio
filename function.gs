var cc = DataStudioApp.createCommunityConnector();

var DEFAULT = {
  "TIMEZONE": { 'ca': 'America/Montreal', 'com': 'Europe/Paris' },
  "TZ_OFFSET": "02",
  "QUERY": {
    "async": false,
    "reports": [
      {
        "kind": "rt#insummary",
        "path": "mcWEBSITE[?].mcGLOBALOPE.mcOPE",
        "dateRanges": [
          { "range": "YESTERDAY" }
        ],
        "dimensions": [
          { "field": "ope_name", "name": "ope" },
          { "field": "media_key", "name": "Media Key" },
          { "field": "publisher_name", "name": "Publisher Name" },
          { "field": "mediaplan_name", "name": "Mediaplan Name" },
          { "field": "submedia_name", "name": "Submedia Name" }
        ],
        "metrics": [
          { "field": "hit", "name": "page views" },
          { "field": "click", "name": "click" },
          { "field": "estimatevalid", "name": "leads", "segment": { "by": "estimatetype" } },
          { "field": "scartvalid", "name": "scartvalid", "segment": { "by": "ordertype" } }
        ]
      }
    ]
  }
};

function isAdminUser() {
  return false;
}

function getAuthType() {
  return {
    type: 'NONE'
  };
}

function getConfig(request) {
  var config = cc.getConfig();

  config.newTextInput()
    .setId("apiDomain")
    .setName(
      "API Endpoint"
    )
    .setHelpText(
      "you can find your API domain on Eulerian (search: \"api\")"
    )
    .setPlaceholder(
      "e.g. https://abc.api.eulerian.com"
    );

  config.newTextInput()
    .setId("apiKey")
    .setName(
      "API token"
    )
    .setHelpText(
      "you can find your API key on Eulerian (search: \"api\")"
    )
    .setPlaceholder(
      "e.g. nMDcfWDpfyc1x40HrfY5g7kCReA.VJM_f54-"
    );

  config.newTextInput()
    .setId("apiSite")
    .setAllowOverride(true)
    .setName(
      "Website name"
    )
    .setHelpText(
      "you can find the website name on Eulerian (website name in the top blue bar)"
    )
    .setPlaceholder(
      "e.g. my-website"
    );

  config.newInfo()
    .setId('query_instructions')
    .setText(
      'Select the date scale for data evolution. A blank entry will revert to Automatic mode: auto-scale'
    );

  config
    .newSelectSingle()
    .setId("dateScale")
    .setName("Date Scale")
    .setHelpText(
      "Choose the time unit. A blank entry will revert to the default value: auto-scale."
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Auto-Scale")
        .setValue("auto")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Per hour")
        .setValue("H")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Per day")
        .setValue("D")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Per week")
        .setValue("W")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Per month")
        .setValue("M")
    )
    .setAllowOverride(true);

  config
    .newSelectSingle()
    .setId("segment")
    .setName("Segmentation")
    .setHelpText(
      "Choose an additional level of segmentation for the datasource. A blank entry will revert to \"none\"."
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("none")
        .setValue("none")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Per Device")
        .setValue("device")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Per Attribution view")
        .setValue("view")
    )
    .setAllowOverride(true);


  config.newInfo()
    .setId('query_instructions')
    .setText(
      'Enter the query to access data. An invalid or blank entry will revert to the default query. Read our documentation to discover how to build your query https://doc.api.eulerian.com/#tag/Batch-Reporting'
    );


  config.newTextArea()
    .setId("query")
    .setName(
      "Query.json"
    )
    .setHelpText(
      "edit your query"
    )
    .setPlaceholder(
      `e.g. {
    "async": false,
    "reports": [
        {
            "kind": "rt#insummary",
            "path": "{{path}}",
            "dimensions": [
                {"name": "media_key", "field": "media_key"},
                {"name": "publisher", "field": "publisher_name"},
                {"name": "ope", "field": "ope_name"}
            ],
            "dateRanges": [
                {"range": "YESTERDAY"}
            ],
            "metrics": [
                {"name": "clics", "field": "click"},
                {"name": "page views", "field": "hit"},
                {"name": "scartvalid", "field": "scartvalid", "segment": {"by": "ordertype"}}
            ]
        }
    ]
}
`
    );

  config
    .newSelectMultiple()
    .setId("filter_device")
    .setName("Device filter")
    .setHelpText(
      "Filter on deviced used during navigation. A blank entry will revert to select all devices"
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Desktop")
        .setValue("1")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Phone")
        .setValue("2")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Tablet")
        .setValue("3")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("TV")
        .setValue("4")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("iOS Device")
        .setValue("5")
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel("Android Device")
        .setValue("6")
    )
    .setAllowOverride(true);


  config.newTextInput()
    .setId("filter_view")
    .setAllowOverride(true)
    .setName(
      "Attribution View ID(s)"
    )
    .setHelpText(
      "An invalid or blank entry will revert to select the default STA view"
    )
    .setPlaceholder(
      "e.g. 4"
    );


  config.setDateRangeRequired(true); // force a new date in the getData (useful to work the ds native relative dates )

  return config.build();
}

// [START get_schema]
function getFields(request, content = {}) {
  console.log("getFields()::START");
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  const FIELDS = { 'text': types.TEXT, 'int': types.NUMBER, 'float': types.NUMBER, 'time': types.NUMBER, 'pct': types.PERCENT };

  console.log("getFields::@request", request);

  request.configParams = validateConfig(request, true);
  content = fetchDataFromApi(request);


  content = content.data.request.reports[0];

  var dimensions = content.dimensions || [];
  var dr_metrics = content.metrics || [];

  console.log("@dimensions", dimensions);
  console.log("@dr_metrics", JSON.stringify(dr_metrics));

  fields.newDimension()
    .setId("reported")
    .setName("Date Reported")
    .setDescription("The date that this was reported")
    //.setFormula('TODATE(reported,"%Y%m%d%H","%Y%m%d%H")')
    .setType(types.YEAR_MONTH_DAY_HOUR);

  fields.newDimension()
    .setId("segment_val")
    .setName("Segmentation Content")
    .setDescription("The segment value (can be a device type or an attribution view depending on the option selected in the datasource")
    .setType(types.TEXT);

  dimensions.forEach(function (dim) {
    fields.newDimension()
      .setId(dim.field)
      .setName(dim.name)
      .setDescription(dim.name)
      .setType(types.TEXT);
  });

  dr_metrics.forEach(function (dr_met) {

    if (dr_met.segment) {
      if (dr_met.segment.values) {
        dr_met.segment.values.forEach(metricSegment => {
          fields.newMetric()
            .setId(dr_met.segment.by + metricSegment.id)
            .setName(`${dr_met.segment.by}_${metricSegment.name}`)
            .setDescription(`${dr_met.field} - type: ${metricSegment.name}`)
            .setType(FIELDS[dr_met.affinity]);
        });
      }
    }
    else {
      fields.newMetric()
        .setId(dr_met.field)
        .setName(dr_met.name)
        .setDescription(dr_met.name)
        .setType(FIELDS[dr_met.affinity]);
    }

  });

  // fields.setDefaultDimension("media_key");

  // console.log('getFields():: @fields.build()', fields.build());
  console.log("getFields()::END");

  return fields;
}




function getSchema(request) {
  return { schema: getFields(request).build() };
}
// [END get_schema]



// [START get_data]
function getData(request) {
  console.log("getData::STARTING");

  request.configParams = validateConfig(request);
  console.log("getData::@request-postvalidateConfig", JSON.stringify(request));

  let timeZone = DEFAULT.TIMEZONE[request.configParams.apiDomain.split(".").pop()];

  var cacheKey = getSHA256(request.configParams.query);
  // console.log('getData():: @cacheKey',cacheKey);

  var apiResponse = getCachedData(cacheKey, request);

  if (apiResponse.error) {
    debug_obj = {
      ...request.configParams,
      api_error_msg: apiResponse.error_msg || "api_error_unknown",
      apiKey: '',
      query: ''
    };
    sendUserError('The connector has encountered an unrecoverable error. Error fetching data from API. Please forward us those details: ##CONFIG##     ' + JSON.stringify(debug_obj) + "     ##QUERY##     " + request.configParams.query);
  } else { console.log("no error detected in the API response"); }

  try {
    var fields = getFields(request, apiResponse);
    var requestedFields = fields.forIds(request.fields.map((field) => field.name));

    var normalizedResponse = normalizeResponse(apiResponse, timeZone);
    var data = getFormattedData(normalizedResponse, requestedFields.asArray());
  } catch (e) {
    console.log(e);
    sendUserError('The connector has encountered an unrecoverable error. Error while retreating response from API. Exception details: ' + e);
  }
  try {
    return {
      schema: requestedFields.build(),
      rows: data
    };
  } catch (e) {
    sendUserError('problem' + e);
  }
}

/**
 * Gets response for UrlFetchApp.
 *
 * @param {Object} request Data request parameters.
 * @returns {string} Response text for UrlFetchApp.
 */
function fetchDataFromApi(request) {
  console.log("fetchDataFromApi()::START");
  var configParams = request.configParams;
  var url = `${configParams.apiDomain}/ea/v2/ea/${configParams.apiSite}/report/batch/query.json`;
  console.log("fetchDataFromApi()::@url", url);
  console.log("fetchDataFromApi()::@query", configParams.query);

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: { "Authorization": `Bearer ${configParams.apiKey}` },
    payload: configParams.query
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
  } catch (e) {
    sendUserError('No servers found when trying to connect. Please check your credentials. Details: ' + e);
  }

  try {
    response = JSON.parse(response);
  } catch (e) {
    sendUserError('The connector has encountered an unrecoverable error. Error fetching data from API')
  }


  console.log("fetchDataFromApi:: @response", response);
  console.log("fetchDataFromApi()::END");
  return response;
}

/**
 * Parses response string into an object. Also standardizes the object structure
 * for single vs multiple packages.
 *
 * @param {Object} request Data request parameters.
 * @param {string} responseString Response from the API.
 * @return {Object} Contains package names as keys and associated download count
 *     information(object) as values.
 */
function normalizeResponse(response, tz) {
  console.log("normalizeResponse()::START");
  // console.log("response", response.data.reports[0]);
  var api_response = response.data.reports[0];
  var _epochs = api_response.columnHeader.dateRanges[0].values; console.log("@epoch", _epochs);
  var _dimensions = api_response.columnHeader.dimensions; // console.log("@dimensions", _dimensions);
  var _metrics = api_response.columnHeader.metrics; // console.log("@metrics", _metrics);
  var _data = api_response.data; // console.log("@data", JSON.stringify(_data));






  var output = [];

  _data.forEach((row, i_epoch) => {
    let row_dim = Object.fromEntries(_dimensions.map((_, index) => [_dimensions[index].field, row.dimensions[index] || ""]));
    if (row_dim.media_key == "GLOBAL") { return; }
    // console.log("row", row);

    var segmentArray = [[]];

    row.metrics.forEach((sub, i_metric) => {

      _metricName = _metrics[i_metric].field;
      if ("segments" in sub && ["device", "view"].includes(Object.keys(sub.segments)[0])) {
        let segType = Object.keys(sub.segments)[0];
        let metric = sub.segments[segType];

        metric.forEach((segment, i_seg) => {

          segmentArray[i_seg] = segmentArray[i_seg] || [];
          let segVal = `${segment.name}_${segment.id}`;

          let values = segment.values;

          if (typeof values[0] === 'object' && values[0] !== null && "segments" in values[0]) {

            let segMetricName = Object.keys(values[0].segments)[0];
            let segMetrics = values[0].segments[segMetricName].map((segMetric, index) => ({ "name": segMetricName + segMetric.id, "values": segMetric.values }));

            segMetrics.forEach((segMetric, segMet_i) => {
              segmentArray[i_seg] = segMetric.values.map((val, index) => ({
                ...segmentArray[i_seg][index],
                ...row_dim,
                "reported": formatGoogleDate(_epochs[index]["epoch"], tz),
                [segMetric.name]: val,
                "segment_val": segVal
              }));
            });

          }
          else {

            if (typeof values[0] === 'object' && values[0] !== null && "values" in values[0]) { values = values[0].values }
            segmentArray[i_seg] = values.map((val, index) => ({
              ...segmentArray[i_seg][index],
              ...row_dim,
              "reported": formatGoogleDate(_epochs[index]["epoch"], tz),
              [_metricName]: val,
              "segment_val": segVal
            }));
          }

        });
      }
      else {
        var sub = (Array.isArray(sub) ? sub[0] : {});
        if ("segments" in sub) {
          let segMetricName = Object.keys(sub.segments)[0];
          let segMetrics = sub.segments[segMetricName].map((segMetric, index) => ({ "name": segMetricName + segMetric.id, "values": segMetric.values }));

          segMetrics.forEach((segMetric, segMet_i) => {
            segmentArray[0] = segMetric.values.map((val, index) => ({
              ...segmentArray[0][index],
              ...row_dim,
              "reported": formatGoogleDate(_epochs[index]["epoch"], tz),
              [segMetric.name]: val,
              "segment_val": "all"
            }));
          });

        }
        else {
          values = sub.values;
          if (typeof values[0] === 'object' && values[0] !== null && "values" in values[0]) { values = values[0].values }

          segmentArray[0] = values.map((val, index) => ({
            ...segmentArray[0][index],
            ...row_dim,
            "reported": formatGoogleDate(_epochs[index]["epoch"], tz),
            [_metricName]: val,
            "segment_val": "all"
          }));
        }
      }

    });

    output = output.concat(segmentArray.flat());
  });
  console.log("normalizeResponse()::@output head 10 rows", JSON.stringify(output.slice(0, 10)));
  console.log("normalizeResponse()::END");
  return output;
}



/**
 * Formats the parsed response from external data source into correct tabular
 * format and returns only the requestedFields
 *
 * @param {Object} parsedResponse The response string from external data source
 *     parsed into an object in a standard format.
 * @param {Array} requestedFields The fields requested in the getData request.
 * @returns {Array} Array containing rows of data in key-value pairs for each
 *     field.
 */
function getFormattedData(report_data, requestedFields) {
  console.log("getFormattedData()::START");
  var data = [];
  report_data.forEach((i) => data.push(formatData(requestedFields, i)));
  console.log("getFormattedData():: @data", data);
  console.log("getFormattedData()::END");
  return data;
}
// [END get_data]


/**
 * Validates config parameters and provides missing values.
 *
 * @param {Object} configParams Config parameters from `request`.
 * @returns {Object} Updated Config parameters.
 */
function validateConfig(r = {}, dryRun = false) {
  console.log("validateConfig()::START");
  try {
    dateRange = r.dateRange || {};
    fields = r.fields || [];
    fields = fields.map(field => field.name);
    configParams = r.configParams || {};

    console.log("validateConfig():: @configParams-query", configParams.query);

    configParams.apiDomain = configParams.apiDomain;
    configParams.apiKey = configParams.apiKey;
    configParams.apiSite = configParams.apiSite;
    configParams.dateScale = configParams.dateScale || "auto";
    configParams.query = { ...(isJson(configParams.query) ? JSON.parse(configParams.query) : DEFAULT.QUERY), dryRun, async: false };
    configParams.segment = configParams.segment || "none";
    configParams.filter_device = (configParams.filter_device ? (Array.isArray(configParams.filter_device) ? configParams.filter_device : configParams.filter_device.split(",")) : []);
    configParams.filter_view = (configParams.filter_view ? (Array.isArray(configParams.filter_view) ? configParams.filter_view : configParams.filter_view.split(",")) : []);
    configParams.filter_view = configParams.filter_view.slice(0, 10).filter(el => /[0-9]{1,3}/.test(el));


    if (dryRun) {
      configParams.query.reports[0].dateRanges = [{ "range": "YESTERDAY" }];
    }

    if (dateRange.startDate) {
      var TZ = DEFAULT.TIMEZONE[configParams.apiDomain.split(".").pop()];
      console.log("TZ detected:", TZ);

      let from = getLocalEpoch(TZ, dateRange.startDate, 'from'),
        to = getLocalEpoch(TZ, dateRange.endDate, 'to');

      configParams.query.reports[0] = {
        ...configParams.query.reports[0],
        dateRanges: [{ from, to }],
        dateRangeSplitPerScale: true,
        dateScale: (configParams.dateScale == 'auto' ? getAutoTimeScale(to - from) : configParams.dateScale)
      };
    }

    if (!(fields.includes("reported"))) {
      delete configParams.query.reports[0].dateRangeSplitPerScale;
      delete configParams.query.reports[0].dateScale;
    }

    if (configParams.filter_device.length || configParams.filter_view.length) {

      let segmentFilterClauses = [];

      if (configParams.filter_device.length && configParams.segment != "device") {
        segmentFilterClauses.push({ "field": "device", "operator": "IN", "value": configParams.filter_device })
      }
      if (configParams.filter_view.length && configParams.segment != "view") {
        segmentFilterClauses.push({ "field": "attributionrule", "operator": "IN", "value": [configParams.filter_view[0]] })
      }

      configParams.query.reports[0] = { ...configParams.query.reports[0], segmentFilterClauses };
    }

    if (configParams.segment != "none") {
      let segments;
      if (configParams.segment == "device") { segments = [{ "name": "Device", "type": "device" }] }
      else if (configParams.segment == "view" && configParams.filter_view.length) {

        segments = [
          {
            "name": "Single Touch Attribution rule",
            "type": "attributionrule",
            "operator": "IN",
            "value": configParams.filter_view
          }
        ]
      }

      configParams.query.reports[0] = { ...configParams.query.reports[0], segments };
    }

    configParams.query = JSON.stringify(configParams.query);

  } catch (e) { console.log(e); }
  console.log("validateConfig()::END");
  return configParams;
}

/**
 * Formats a single row of data into the required format.
 *
 * @param {Object} requestedFields Fields requested in the getData request.
 * @param {string} packageName Name of the package who's download data is being
 *    processed.
 * @param {Object} dailyDownload Contains the download data for a certain day.
 * @returns {Object} Contains values for requested fields in predefined format.
 */
function formatData(requestedFields, input) {
  var row = requestedFields
    .map((requestedField) => {
      let value = input[requestedField.getId()] || "0";
      return value
    });
  return { values: row };
}