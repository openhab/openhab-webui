/**
 * Z-Wave Network Graph Provider
 *
 * Transforms Z-Wave thing data into a unified NetworkGraph format
 */

import type {
  NetworkGraph,
  NetworkGraphProvider,
  NetworkNode,
  NetworkLink,
  NetworkLegend,
} from "../types";

/**
 * Color constants for Z-Wave node types
 */
enum RoleColors {
  controller = "#FF9800",
  listening = "#FFEB3B",
  sleeping = "#607D8B",
  unknown = "#9E9E9E",
}

enum RoleSizes {
  controller = 50,
  listening = 35,
  sleeping = 30,
  unknown = 28,
}

/**
 * Z-Wave Network Graph Provider
 */
export class ZWaveNetworkProvider implements NetworkGraphProvider {
  readonly title = "Z-Wave Network Map";

  private static readonly LEGEND: NetworkLegend = {
    nodeRoles: [
      {
        id: "controller",
        label: "Controller",
        color: RoleColors.controller,
        size: RoleSizes.controller,
      },
      {
        id: "listening",
        label: "Always Listening",
        color: RoleColors.listening,
        size: RoleSizes.listening,
      },
      {
        id: "sleeping",
        label: "Battery/Sleeping",
        color: RoleColors.sleeping,
        size: RoleSizes.sleeping,
      },
    ],
    linkQualities: [],
    linkTypes: [
      { id: "peer", label: "Bidirectional", symbol: "none" },
      { id: "asymmetric", label: "Unidirectional", symbol: "arrow", lineStyle: "dashed" },
    ],
  };

  buildGraph(things: any[], bridgeUID: string): NetworkGraph {
    const zWaveNodes = things.filter(
      (t) =>
        (t.bridgeUID === bridgeUID || t.UID === bridgeUID) &&
        t.properties &&
        t.properties.zwave_nodeid &&
        t.properties.zwave_neighbours,
    );

    const nodes: NetworkNode[] = [];
    const linkData: Array<[string, string]> = [];
    const controllerIds = new Set<string>();

    zWaveNodes.forEach((thing) => {
      const nodeId = thing.properties.zwave_nodeid;
      const isController = !thing.bridgeUID;
      const listening = thing.properties.zwave_listening === "true";

      if (isController) {
        controllerIds.add(nodeId);
      }

      let role: string;
      if (isController) {
        role = "controller";
      } else if (listening) {
        role = "listening";
      } else {
        role = "sleeping";
      }

      nodes.push({
        id: nodeId,
        label: thing.label || `Node ${nodeId}`,
        role,
        status: thing.statusInfo?.status === "ONLINE" ? "online" : "offline",
        statusColor: this.getStatusColor(thing.statusInfo),
        properties: {
          thingUID: thing.UID,
          nodeId,
        },
      });

      linkData.push([nodeId, thing.properties.zwave_neighbours || ""]);
    });

    const links = this.createLinks(linkData, controllerIds);

    return {
      networkType: "zwave",
      networkId: bridgeUID,
      title: "Z-Wave Network Map",
      legend: ZWaveNetworkProvider.LEGEND,
      nodes,
      links,
      displayOptions: {
        gravity: 0.9,
        repulsion: 2000,
        edgeLength: 120,
        layoutAnimation: false,
        symbolSize: 28,
        fontSize: 16,
        labelPosition: "inside",
        labelContent: "id",
        lineWidth: 1,
        lineCurveness: 0.3,
        lineOpacity: 0.7,
      },
    };
  }

  private createLinks(
    linkData: Array<[string, string]>,
    controllerIds: Set<string>,
  ): NetworkLink[] {
    const links: NetworkLink[] = [];
    const linkMap = new Map<string, NetworkLink>();

    linkData.forEach(([nodeId, neighbours]) => {
      if (!neighbours) return;

      neighbours.split(",").forEach((n) => {
        if (!n) return;

        const reverseKey = `${n}|${nodeId}`;
        const forwardKey = `${nodeId}|${n}`;

        const existingReverse = linkMap.get(reverseKey);
        if (existingReverse) {
          // Found reverse link - make it bidirectional (peer)
          existingReverse.type = "peer";
          const backLink: NetworkLink = {
            source: nodeId,
            target: n,
            type: "peer",
          };
          linkMap.set(forwardKey, backLink);
          links.push(backLink);
          return;
        }

        // SPECIAL CASE: controller never reports neighbors
        const isControllerPair =
          (controllerIds.has(nodeId) && !controllerIds.has(n)) ||
          (controllerIds.has(n) && !controllerIds.has(nodeId));

        if (isControllerPair) {
          // Force bidirectional links
          const link: NetworkLink = {
            source: nodeId,
            target: n,
            type: "peer",
          };
          linkMap.set(forwardKey, link);
          links.push(link);
          return;
        }

        // Create new unidirectional link
        const link: NetworkLink = {
          source: nodeId,
          target: n,
          type: "asymmetric",
        };
        linkMap.set(forwardKey, link);
        links.push(link);
      });
    });

    return links;
  }

  private getStatusColor(statusInfo: any): string {
    if (!statusInfo) return "#9E9E9E";
    switch (statusInfo.status) {
      case "ONLINE":
        return "#4CAF50";
      case "OFFLINE":
        return "#F44336";
      case "UNKNOWN":
        return "#9E9E9E";
      default:
        return "#9E9E9E";
    }
  }
}

export const zwaveNetworkProvider = new ZWaveNetworkProvider();
