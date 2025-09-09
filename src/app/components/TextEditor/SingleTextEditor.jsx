import React from 'react';
import {
  RichTextEditorComponent, Toolbar, Link, Table, QuickToolbar,
  Image, HtmlEditor, Inject
} from '@syncfusion/ej2-react-richtexteditor';

class SingleTextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.customToolbarSettings = {
      items: [
        'Bold', 'Italic', 'Underline', 'StrikeThrough', 'FontName', 'FontSize', 'FontColor', 'BackgroundColor',
        'LowerCase', 'UpperCase', '|',
        'Formats', 'Alignments', 'OrderedList', 'UnorderedList', 'Outdent', 'Indent', '|',
        'CreateLink', 'Image', 'CreateTable', '|',
        'ClearFormat', 'Print', 'Undo', 'Redo', 'SourceCode'
      ]
    };
    this.quickToolbarSettings = {
      image: ['Replace', 'Align', 'Caption', 'Remove', 'InsertLink', 'OpenImageLink', 'EditImageLink']
    };
  }

    updateContent = () => {
        const htmlContent = this.rteObject.getHtml();
        if (this.props.setDescription) {
            this.props.setDescription(htmlContent);
        }
    };


  render() {
    const { value } = this.props;

    return (
      <div>
        <RichTextEditorComponent
          value={value}
          ref={(richtexteditor) => {
            this.rteObject = richtexteditor;
          }}
          toolbarSettings={this.customToolbarSettings}
          quickToolbarSettings={this.quickToolbarSettings}
          change={() => this.updateContent()}
          blur={() => this.updateContent()}
          focus={() => this.updateContent()}
          created={() => this.updateContent()}
          insertImageSettings={{
            saveFormat: 'Base64'
          }}
        >
          <Inject services={[Toolbar, Link, Image, HtmlEditor, Table,QuickToolbar]} />
        </RichTextEditorComponent>
      </div>
    );
  }
}

export default SingleTextEditor;
