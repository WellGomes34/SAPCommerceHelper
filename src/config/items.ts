export type SelectOption = {
  label: string;
  value: string;
};

export type AttributeField = {
  id: string;
  label: string;
  placeholder?: string;
  values?: string[] | SelectOption[];
  required?: boolean;
};

type BaseWizardField = {
  id: string;
  label: string;
};

export type TextWizardField = BaseWizardField & {
  type: 'text';
  placeholder?: string;
  required?: boolean;
  values?: string[] | SelectOption[];
};

export type AttributesWizardField = BaseWizardField & {
  type: 'attributes';
  fields: AttributeField[];
};

export type WizardField = TextWizardField | AttributesWizardField;

export type WizardItem = {
  id: string;
  label: string;
  language: string;
  fields: WizardField[];
  template: (data: any) => string;
};

export const JAVA_TYPES = [
  { label: 'String', value: 'java.lang.String' },
  { label: 'Integer', value: 'java.lang.Integer' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Date', value: 'java.util.Date' },
  { label: 'Media', value: 'Media' },
  { label: 'Link', value: 'CMSLinkComponent' },
  { label: 'Paragraph', value: 'CMSParagraphComponent' },
];

export const REQUEST_METHODS = [
  { label: 'GET',  value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'DELETE', value: 'DELETE' },
];

export const CARDINALITY = [
  { label: 'One', value: 'one' },
  { label: 'Many', value: 'many' },
];

export const BOOLEAN_LIST = [
  { label: 'True', value: 'true' },
  { label: 'False', value: 'false' },
];


export const ITEMS: WizardItem[] = [
  //Component
  {
    id: 'component',
    label: 'CMS Component',
    language: 'java',
    fields: [
      {
        id: 'name',
        label: 'Component Name',
        placeholder: 'MyComponent',
        type: 'text',
        required: true,
      },
      {
        id: 'project',
        label: 'Project Name',
        placeholder: 'Project',
        type: 'text',
        required: true,
      },
      {
        id: 'typeCode',
        label: 'Type Code',
        placeholder: '12345',
        type: 'text',
        required: false,
      },
      {
        id: 'description',
        label: 'Component Description',
        placeholder: 'This Component is meant to...',
        type: 'text',
        required: false,
      },
      {
        id: 'attributes',
        label: 'Atributos',
        type: 'attributes',
        fields: [
          {
            id: 'name',
            label: 'Attribute Name',
            placeholder: 'user',
            required: true,
          },
          {
            id: 'type',
            label: 'Attribute Type',
            placeholder: 'type',
            required: true,
            values: JAVA_TYPES
          },
        ]
      }
    ],
    template: data => `
// Core Items
<itemtype code="${data.name}Component" extends="CMSParagraphComponent" autocreate="true" generate="true">
    <deployment table="${toLowercase(data.name)}" typecode="${data.typeCode ? data.typeCode : ''}"/>
    ${data.description ? `<description>${data.description}</description>` : ''}
    <attributes>
      ${(data.attributes || []).map((a:any) => `
        <attribute qualifier="${a.name}" type="${a.type}">
          <persistence type="property" />
        </attribute>
      `).join('\n')}
      
    </attributes>
</itemtype>

// Controller Constants
import br.com.${data.project}.core.model.components.${data.name}Model;

String ${capitalize(data.name)}Component = _Prefix + ${data.name}Model.TYPECODE + _Suffix;

// ${capitalize(data.name)}Controller.java
@Controller("${capitalize(data.name)}Controller")
@RequestMapping(value = ControllerConstants.Actions.Cms.${capitalize(data.name)})
public class ${capitalize(data.name)}Controller extends AbstractCMSComponentController<${data.name}Model> {

    @Override
    protected void fillModel(
        final HttpServletRequest request,
        final Model model,
        final ${data.name}Model component
    ) {

${(data.attributes || [])
  .map(
    (a:any) => `        model.addAttribute("${a.name}", component.get${capitalize(a.name)}());`
  )
  .join('\n')}
    }

    @Override
    protected String getView(${data.name}Model component) {
      return ControllerConstants.Views.Cms.ComponentPrefix
        + StringUtils.lowerCase(${data.name}Model._TYPECODE);
    }
}
`
  },

  //Relation
  {
    id: 'relation',
    label: 'Relation',
    language: 'java',
    fields: [
      {
        id: 'code',
        label: 'Relation Code',
        placeholder: 'MyComponent',
        type: 'text',
        required: true,
      },
      {
        id: 'typeCode',
        label: 'Type Code',
        placeholder: '12345',
        type: 'text',
        required: false,
      },
      {
        id: 'description',
        label: 'Relation Description',
        placeholder: 'MyRelation',
        type: 'text',
        required: false,
      },
      {
        id: 'sourceElement',
        label: 'Source Element',
        placeholder: 'componentX',
        type: 'text',
        required: true,
      },
      {
        id: 'sourceElementMandatory',
        label: 'is Source Element Optional?',
        placeholder: 'true',
        type: 'text',
        values: BOOLEAN_LIST,
        required: true,
      },
      {
        id: 'sourceElementCardinality',
        label: 'Source Element Cardinality',
        placeholder: 'true',
        type: 'text',
        values: CARDINALITY,
        required: true,
      },
       {
        id: 'targetElement',
        label: 'Target Element',
        placeholder: 'componentY',
        type: 'text',
        required: true,
      },
      {
        id: 'targetElementMandatory',
        label: 'is Target Element Optional?',
        placeholder: 'true',
        type: 'text',
        values: BOOLEAN_LIST,
        required: true,
      },
      {
        id: 'targetElementCollectionType',
        label: 'Target Element Collection Type',
        placeholder: 'true',
        type: 'text',
        values: [
          {
            label: 'Set',
            value: 'set'
          },
          {
            label: 'List',
            value: 'list'
          },
        ],
        required: true,
      },
      {
        id: 'targetElementCardinality',
        label: 'Target Element Cardinality',
        placeholder: 'true',
        type: 'text',
        values: CARDINALITY,
        required: true,
      },

    ],
    template: data => `
<relation code="${data.code}" generate="true" localized="false" autocreate="true"> 
  ${data.description ? `<description>${data.description}</description>` : ''}
  <deployment table="${toLowercase(data.code)}" typecode="${data.typeCode ? data.typeCode : ''}"/>
  <sourceElement qualifier="${data.sourceElement}" type="${capitalize(data.sourceElement)}" cardinality="${data.sourceElementCardinality}">
    <modifiers read="true" write="true" search="true" optional="${data.sourceElementMandatory}"/>
  </sourceElement>
  <targetElement qualifier="${data.targetElement}" type="${capitalize(data.targetElement)}" collectiontype="${data.targetElementCollectionType}" cardinality="${data.targetElementCardinality}">
      <modifiers read="true" write="true" search="true" optional="${data.targetElementMandatory}"/>
  </targetElement>
</relation>
`
  },

  //Table
  {
    id: 'table',
    label: 'Table',
    language: 'java',
    fields: [
      {
        id: 'name',
        label: 'Table Name',
        placeholder: 'MyTable',
        type: 'text',
        required: true,
      },
      {
        id: 'typeCode',
        label: 'Type Code',
        placeholder: '12345',
        type: 'text',
        required: false,
      },
      {
        id: 'description',
        label: 'Component Description',
        placeholder: 'This Component is meant to...',
        type: 'text',
        required: false,
      },
      {
        id: 'attributes',
        label: 'Attributes',
        type: 'attributes',
        fields: [
          {
            id: 'name',
            label: 'Attribute Name',
            placeholder: 'Name',
            required: true,
          },
          {
            id: 'optional',
            label: 'Optional?',
            placeholder: 'true',
            required: true,
            values: BOOLEAN_LIST
          },
          {
            id: 'type',
            label: 'Type',
            placeholder: 'String',
            required: true,
            values: JAVA_TYPES
          }
        ]
      }
    ],
    template: data => `
<itemtype code="${data.name}" autocreate="true" generate="true">
    <deployment table="${toLowercase(data.name)}" typecode="${data.typeCode ? data.typeCode : ''}"/>
    ${data.description ? `<description>${data.description}</description>` : ''}
    <attributes>
      ${(data.attributes || []).map((a:any) => `
        <attribute qualifier="${a.name}" type="${a.type}">
          <modifiers read="true" write="true" search="true" optional="${a.optional}"/>
          <persistence type="property" />
        </attribute>
      `).join('\n')}
    </attributes>
</itemtype>
`
  },

  // Controller
  {
    id: 'controller',
    label: 'Controller',
    language: 'java',
    fields: [
      {
        id: 'name',
        label: 'Name',
        placeholder: 'Name',
        type: 'text',
        required: true,
      },
      {
        id: 'project',
        label: 'Project Name',
        placeholder: 'project',
        type: 'text',
        required: true,
      },
      {
        id: 'method',
        label: 'Request Method',
        placeholder: 'getProducts',
        type: 'text',
        required: true,
        values: REQUEST_METHODS
      },
    ],
    template: data => `
import de.hybris.${data.project}.core.service${capitalize(data.name)}Service;
import org.apache.commons.lang.StringUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import javax.annotation.Resource;

@Controller
@RequestMapping("/${toLowercase(data.name)}")
public class ${capitalize(data.name)}Controller {

  @Resource
  private ${capitalize(data.name)}Service ${toLowercase(data.name)}Service;

  @RequestMapping(value="/get${data.name}", method = requestMethod.${data.method}, produces="application/json")
  public ResponseEntity<${capitalize(data.name)}Dto> get${capitalize(data.name)}() {
    return ResponseEntity.ok(${toLowercase(data.name)}Service.get${capitalize(data.name)}());
  }
}
    `
  },

  // Service
  {
    id: 'service',
    label: 'Service',
    language: 'java',
    fields: [
      {
        id: 'name',
        label: 'Service and Dao Name',
        placeholder: 'MyClass',
        type: 'text'
      },
      {
        id: 'project',
        label: 'Project Name',
        placeholder: 'Project',
        type: 'text',
        required: true,
      },
    ],
    template: data => `
// ${data.name}Service.java
package de.hybris.${data.project}.core.service;
import de.hybris.${data.project}.model.${capitalize(data.name)}Model;
import java.util.List;
import java.util.Optional;
import de.hybris.${data.project}.dto.${capitalize(data.name)}Dto;

public interface ${capitalize(data.name)}Service {
  ${capitalize(data.name)}Dto ${toLowercase(data.name)}(String id);
}

//Default${data.name}Service.java
package de.hybris.${data.project}.core.service.impl;

import de.hybris.${data.project}.core.dao.${capitalize(data.name)}Dao;
import de.hybris.${data.project}.core.model.${capitalize(data.name)}Model;
import de.hybris.${data.project}.core.service.${capitalize(data.name)}Service;
import de.hybris.${data.project}.dto.${capitalize(data.name)}Dto;

import javax.annotation.Resource;
import java.util.List;
import java.util.Optional;

public class Default${capitalize(data.name)}Service implements ${capitalize(data.name)}Service {
  @Resource
  private ${capitalize(data.name)}Dao ${toLowercase(data.name)}Dao;

  @Override
  public ${capitalize(data.name)}Dto get${capitalize(data.name)} (String id) {
    ${capitalize(data.name)}Dto ${toLowercase(data.name)}Dto = new ${capitalize(data.name)}Dto();

    ${capitalize(data.name)}Model ${toLowercase(data.name)}Model = ${toLowercase(data.name)}Dao.findSampleById(id);

    if(${toLowercase(data.name)}Model != null) {
      ${(data.attributes || []).map((a:any) => `
        ${toLowercase(data.name)}Dto.set${capitalize(a.name)}(${toLowercase(data.name)}Model.get${capitalize(a.name)}());
      `).join('\n')}
      
      return ${toLowercase(data.name)}Dto;
    }

    return null;
  }
}
    `
  },

  // Dao
  {
    id: 'dao',
    label: 'Dao',
    language: 'java',
    fields: [
      {
        id: 'name',
        label: 'Dao Name',
        placeholder: 'MyClass',
        type: 'text'
      },
      {
        id: 'project',
        label: 'Project Name',
        placeholder: 'Project',
        type: 'text',
        required: true,
      },
    ],
    template: data => `
// ${capitalize(data.name)}Dao.java
package de.hybris.${data.project}.core.dao;

import de.hybris.${data.project}.core.model.${capitalize(data.name)}Model;

import java.util.List;
import java.util.Optional;

public interface ${capitalize(data.name)} {
  ${capitalize(data.name)}Model findSampleById(String id);
}

// Default${capitalize(data.name)}Dao.java
package de.hybris.${data.project}.core.dao.impl;

import de.hybris.${data.project}.core.dao.${capitalize(data.name)}Dao;
import de.hybris.${data.project}.model.${capitalize(data.name)}Model;
import de.hybris.platform.servicelayer.search.FlexibleSearchQuery;
import de.hybris.platform.servicelayer.search.FlexibleSearchService;
import de.hybris.platform.servicelayer.search.SearchResult;

import javax.annotation.Resource;
import java.util.List;
import java.util.Optional;

public class Default${capitalize(data.name)}Dao implements ${capitalize(data.name)}Dao {
  @Resource

  private FlexibleSearchService flexibleSearchService;

  protected static final String SAMPLE_QUERY = "SELECT {PK} FROM {${capitalize(data.name)}} WHERE {id} = ?id";

  @Override
  public ${capitalize(data.name)}Model get${capitalize(data.name)}(String id) {
    final FlexibleSearchQuery flexibleSearchQuery = new FlexibleSearchQuery(SAMPLE_QUERY);
    flexibleSearchQuery.addQueryParameter("id", id);
    final SearchResult<${capitalize(data.name)}Model> result = getFlexibleSearchService().search(flexibleSearchQuery);
    if(result.getCount() == 0) {
      return null;
    }
    return result.getResult().get(0);
  }

  public FlexibleSearchService getFlexibleSearchService() {
    return flexibleSearchService;
  }
}
    `
  },

  // Controller, Service And Dao
  {
    id: 'controllerServiceAndDao',
    label: 'Controller Service and Dao',
    language: 'java',
    fields: [
      {
        id: 'name',
        label: 'Main Name',
        placeholder: 'MyClass',
        type: 'text',
        required: true,
      },
      {
        id: 'project',
        label: 'Project Name',
        placeholder: 'Project',
        type: 'text',
        required: true,
      },
      {
        id: 'method',
        label: 'Request Method',
        placeholder: 'getProducts',
        type: 'text',
        required: true,
        values: REQUEST_METHODS
      },
      {
        id: 'attributes',
        label: 'Table Attributes',
        type: 'attributes',
        fields: [
          {
            id: 'name',
            label: 'Attribute Name',
            placeholder: 'Name',
            required: true,
          },
          {
            id: 'type',
            label: 'Type',
            placeholder: 'String',
            required: true,
            values: JAVA_TYPES
          }
        ]
      }
    ],
    template: data => `
// ${data.name}Controller.java

import de.hybris.${data.project}.core.service${capitalize(data.name)}Service;
import org.apache.commons.lang.StringUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import javax.annotation.Resource;

@Controller
@RequestMapping("/${toLowercase(data.name)}")
public class ${data.name}Controller {

  @Resource
  private ${capitalize(data.name)}Service ${toLowercase(data.name)};

  @RequestMapping(value="/get${capitalize(data.name)}", method = requestMethod.${data.method}, produces="application/json")
  public ResponseEntity<${capitalize(data.name)}Dto> get${capitalize(data.name)}() {
    return ResponseEntity.ok(${data.name}Service.get${capitalize(data.name)}());
  }
}

// ${data.name}Service.java

package de.hybris.${data.project}.core.service;
import de.hybris.${data.project}.model.${capitalize(data.name)}Model;
import java.util.List;
import java.util.Optional;
import de.hybris.${data.project}.dto.${capitalize(data.name)}Dto;

public interface ${capitalize(data.name)}Service {
  ${capitalize(data.name)}Dto get${capitalize(data.name)}(String id);
}

//Default${data.name}Service.java
package de.hybris.${data.project}.core.service.impl;

import de.hybris.${data.project}.core.dao.${capitalize(data.name)}Dao;
import de.hybris.${data.project}.core.model.${capitalize(data.name)}Model;
import de.hybris.${data.project}.core.service.${capitalize(data.name)}Service;
import de.hybris.${data.project}.dto.${capitalize(data.name)}Dto;

import javax.annotation.Resource;
import java.util.List;
import java.util.Optional;

public class Default${capitalize(data.name)}Service implements ${capitalize(data.name)}Service {
  @Resource
  private ${capitalize(data.name)}Dao ${toLowercase(data.name)}Dao;

  @Override
  public ${capitalize(data.name)}Dto get${capitalize(data.name)} (String id) {
    ${capitalize(data.name)}Dto ${toLowercase(data.name)}Dto = new ${capitalize(data.name)}Dto();

    ${capitalize(data.name)}Model ${toLowercase(data.name)}Model = ${toLowercase(data.name)}Dao.findSampleById(id);

    if(${toLowercase(data.name)}Model != null) {
      ${(data.attributes || []).map((a:any) => `
        ${toLowercase(data.name)}Dto.set${capitalize(a.name)}(${toLowercase(data.name)}Model.get${capitalize(a.name)}());
      `).join('\n')}
      
      return ${toLowercase(data.name)}Dto;
    }

    return null;
  }
}

// ${capitalize(data.name)}Dao.java
package de.hybris.${data.project}.core.dao;

import de.hybris.${data.project}.core.model.${capitalize(data.name)}Model;

import java.util.List;
import java.util.Optional;

public interface ${capitalize(data.name)}Dao {
  ${capitalize(data.name)}Model findSampleById(String id);
}

// Default${capitalize(data.name)}Dao.java
package de.hybris.${data.project}.core.dao.impl;

import de.hybris.${data.project}.core.dao.${capitalize(data.name)}Dao;
import de.hybris.${data.project}.model.${capitalize(data.name)}Model;
import de.hybris.platform.servicelayer.search.FlexibleSearchQuery;
import de.hybris.platform.servicelayer.search.FlexibleSearchService;
import de.hybris.platform.servicelayer.search.SearchResult;

import javax.annotation.Resource;
import java.util.List;
import java.util.Optional;

public class Default${capitalize(data.name)}Dao implements ${capitalize(data.name)}Dao {
  @Resource

  private FlexibleSearchService flexibleSearchService;

  protected static final String SAMPLES_QUERY = "SELECT {PK} FROM {Messages} WHERE {id} = ?id";

  @Override
  public ${capitalize(data.name)}Model findSampleById(String id) {
    final FlexibleSearchQuery flexibleSearchQuery = new FlexibleSearchQuery(SAMPLES_QUERY);
    flexibleSearchQuery.addQueryParameter("id", id);
    final SearchResult<${capitalize(data.name)}Model> result = getFlexibleSearchService().search(flexibleSearchQuery);
    if(result.getCount() == 0) {
      return null;
    }
    return result.getResult().get(0);
  }

  public FlexibleSearchService getFlexibleSearchService() {
    return flexibleSearchService;
  }
}
    `
  },
];

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toLowercase(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}
