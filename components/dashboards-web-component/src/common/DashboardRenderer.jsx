/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GoldenLayout from 'golden-layout';
import GoldenLayoutContentUtils from '../utils/GoldenLayoutContentUtils';
import WidgetRenderer from './WidgetRenderer';

import '../common/styles/dashboard-renderer-styles.css';
import '../common/styles/custom-goldenlayout-dark-theme.css';
import glDarkTheme from '!!css-loader!../common/styles/custom-goldenlayout-dark-theme.css';
import '../common/styles/custom-goldenlayout-light-theme.css';
import glLightTheme from '!!css-loader!../common/styles/custom-goldenlayout-light-theme.css';

const glDarkThemeCss = glDarkTheme.toString();
const glLightThemeCss = glLightTheme.toString();
const dashboardContainerId = 'dashboard-container';

export default class DashboardRenderer extends Component {

    constructor(props) {
        super(props);
        this.goldenLayout = null;

        this.handleWindowResize = this.handleWindowResize.bind(this);
        this.renderGoldenLayout = this.renderGoldenLayout.bind(this);
        this.destroyGoldenLayout = this.destroyGoldenLayout.bind(this);
        this.triggerThemeChangeEvent = this.triggerThemeChangeEvent.bind(this);
    }

    handleWindowResize() {
        if (this.goldenLayout) {
            this.goldenLayout.updateSize();
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
        this.destroyGoldenLayout();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.goldenLayoutContents !== nextProps.goldenLayoutContents) {
            // Receiving a new dashboard to render.
            this.destroyGoldenLayout();
            return true;
        } else if (this.props.theme !== nextProps.theme) {
            // Receiving a new theme.
            this.triggerThemeChangeEvent(nextProps.theme);
            return true;
        }
        return false;
    }

    render() {
        return (
            <span>
                <style>{this.props.theme.name === 'dark' ? glDarkThemeCss : glLightThemeCss}</style>
                <div id={dashboardContainerId}
                     className='dashboard-container'
                     style={{
                         color: this.props.theme.palette.textColor,
                         backgroundColor: this.props.theme.palette.canvasColor,
                         fontFamily: this.props.theme.fontFamily
                     }}
                     ref={() => this.renderGoldenLayout()}>
                </div>
            </span>
        );
    }

    renderGoldenLayout() {
        if (this.goldenLayout) {
            return;
        }

        let config = {
            settings: {
                hasHeaders: true,
                constrainDragToContainer: false,
                reorderEnabled: false,
                selectionEnabled: false,
                popoutWholeStack: false,
                blockedPopoutsThrowError: true,
                closePopoutsOnUnload: true,
                showPopoutIcon: false,
                showMaximiseIcon: true,
                responsive: true,
                isClosable: false,
                responsiveMode: 'always',
                showCloseIcon: false,
            },
            dimensions: {
                headerHeight: 37
            },
            isClosable: false,
            content: this.props.goldenLayoutContents || []
        };
        let goldenLayout = new GoldenLayout(config, document.getElementById(dashboardContainerId));
        let loadingWidgetNames = GoldenLayoutContentUtils.getReferredWidgetNames(this.props.goldenLayoutContents);
        loadingWidgetNames.forEach(widgetName => goldenLayout.registerComponent(widgetName, WidgetRenderer));
        // Workaround suggested in https://github.com/golden-layout/golden-layout/pull/348#issuecomment-350839014
        setTimeout(() => {
            goldenLayout.init();
        }, 0);
        this.goldenLayout = goldenLayout;
    }

    destroyGoldenLayout() {
        if (this.goldenLayout) {
            this.goldenLayout.destroy();
            delete this.goldenLayout;
        }
        this.goldenLayout = null;
    }

    triggerThemeChangeEvent(newTheme) {
        if (this.goldenLayout) {
            this.goldenLayout.eventHub.trigger('__mui-theme-change', newTheme);
        }
    }
}

DashboardRenderer.propTypes = {
    goldenLayoutContents: PropTypes.array,
    theme: PropTypes.object
};
