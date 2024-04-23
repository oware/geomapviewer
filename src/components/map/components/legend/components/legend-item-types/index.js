import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import { replace } from "@wmo-raf/layer-manager";
import {
  LegendItemTypeBasic,
  LegendItemTypeGradient,
  LegendItemTypeGradientVertical,
  LegendItemTypeProportional,
  LegendItemTypeImage,
  LegendItemTypeChoroplethVertical,
} from "@/components/legend";

import Loader from "@/components/ui/loader";
import LegendItemTypeChoropleth from "./legend-item-type-choropleth";

import "./styles.scss";

class LegendItemTypes extends PureComponent {
  static propTypes = {
    // Props
    children: PropTypes.node,
    activeLayer: PropTypes.object,
  };

  static defaultProps = {
    // Props
    children: [],
    activeLayer: {},
  };

  state = {
    activeLayer: {},
    loading: false,
  };

  componentDidMount() {
    const { activeLayer } = this.props;
    const { legendConfig } = activeLayer || {};
    const { params = {}, sqlParams = {} } = legendConfig || {};

    const parsedConfig = replace(
      JSON.stringify(legendConfig),
      params,
      sqlParams
    );
    const { url } = (parsedConfig && JSON.parse(parsedConfig)) || {};

    if (url) {
      this.fetchLegend(url);
    }
  }

  componentDidUpdate(prevProps) {
    const { activeLayer: prevActiveLayer } = prevProps;
    const { legendConfig: prevLegendConfig } = prevActiveLayer;
    const { params: prevParams = {}, sqlParams: prevSqlParams = {} } =
      prevLegendConfig;

    const { activeLayer: nextActiveLayer } = this.props;
    const { legendConfig: nextLegendConfig } = nextActiveLayer;
    const { params: nextParams = {}, sqlParams: nextSqlParams = {} } =
      nextLegendConfig;

    if (
      !isEqual(nextParams, prevParams) ||
      !isEqual(nextSqlParams, prevSqlParams)
    ) {
      const stringifyConfig = replace(
        JSON.stringify(nextLegendConfig),
        nextParams,
        nextSqlParams
      );
      const parsedConfig = JSON.parse(stringifyConfig);
      const { url } = parsedConfig || {};

      if (url) {
        this.fetchLegend(url);
      }
    }
  }

  fetchLegend = (url) => {
    const { activeLayer } = this.props;
    const { legendConfig } = activeLayer || {};
    const { dataParse } = legendConfig || {};
    this.setState({ loading: true });

    fetch(url)
      .then((response) => {
        if (response.ok) return response.json();
      })
      .then((response) => {
        const parsedActiveLayer =
          typeof dataParse === "function"
            ? dataParse(activeLayer, response)
            : response;
        this.setState({ activeLayer: parsedActiveLayer, loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const { children, activeLayer: propsActiveLayer } = this.props;
    const { loading, activeLayer: stateActiveLayer } = this.state;
    const activeLayer = !isEmpty(stateActiveLayer)
      ? stateActiveLayer
      : propsActiveLayer;

    const { legendConfig } = activeLayer || {};
    const { url } = legendConfig || {};
    const shouldRender = !url || (url && !isEmpty(stateActiveLayer));

    return (
      <div className="c-legend-item-types">
        {url && loading && <Loader />}

        {shouldRender &&
          !!React.Children.count(children) &&
          React.Children.map(children, (child) =>
            React.isValidElement(child) && typeof child.type !== "string"
              ? React.cloneElement(child, { ...this.props })
              : child
          )}

        {/* If there is no children defined, let's use the components we have */}
        {shouldRender && !React.Children.count(children) && (
          <LegendItemTypeBasic {...this.props} />
        )}

        {shouldRender && !React.Children.count(children) && (
          <LegendItemTypeChoropleth {...this.props} />
        )}

        {shouldRender && !React.Children.count(children) && (
          <LegendItemTypeChoroplethVertical {...this.props} />
        )}

        {shouldRender && !React.Children.count(children) && (
          <LegendItemTypeGradient {...this.props} />
        )}

        {shouldRender && !React.Children.count(children) && (
          <LegendItemTypeGradientVertical {...this.props} />
        )}

        {shouldRender && !React.Children.count(children) && (
          <LegendItemTypeProportional {...this.props} />
        )}

        {shouldRender && !React.Children.count(children) && (
          <LegendItemTypeImage {...this.props} />
        )}
      </div>
    );
  }
}

export default LegendItemTypes;
