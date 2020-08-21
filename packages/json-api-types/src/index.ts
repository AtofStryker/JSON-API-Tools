export interface LinkBase {
  self: string;
}

export interface LinkRelationship extends LinkBase {
  related: string;
}

export interface MetaCount {
  count: number;
}

export interface ResourceBaseModel {
  id: string;
  type: string;
}

export interface RelationshipModel {
  [index: string]: any;
  data: ResourceBaseModel | ResourceBaseModel[] | null;
  links?: LinkRelationship;
  meta?: MetaCount;
}

export interface ResourceModel extends ResourceBaseModel {
  [index: string]: any;
  attributes: {
    [index: string]: any;
  };
  links: LinkBase;
  relationships: {
    [key: string]: RelationshipModel;
  };
}
export interface HashObject {
  id?: string;
  type: string;
  fields?: {
    [key: string]: string;
  };
}

export interface RawResponse {
  [index: string]: any;
  data: ResourceModel | ResourceModel[];
  included?: ResourceModel[];
  links?: LinkRelationship;
}

export interface ParsedResourceModel extends ResourceBaseModel {
  links: LinkBase;
  [index: string]: any;
}
