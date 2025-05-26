import { HelpOutline } from '@material-ui/icons';
import React from 'react';
import { Button, Popover, PopoverBody, PopoverHeader } from 'shards-react';

export default class PopoverExample extends React.Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      open: false,
      icon: this.props.icon || <HelpOutline style={{ fontSize: 18 }} className="text-light" />
    };
  }

  toggle() {
    this.setState({
      open: !this.state.open
    });
  }

  render() {
    const { style, title, detail } = this.props;
    return (
      <div style={style}>
        <Button
          theme="light"
          id="popover-1"
          onClick={this.toggle}
          style={{ backgroundColor: 'transparent', borderColor: 'transparent' }}
        >
          {this.state.icon}
        </Button>

        <Popover placement="bottom" open={this.state.open} toggle={this.toggle} target="#popover-1">
          <PopoverHeader>{title || 'Title here'}</PopoverHeader>
          <PopoverBody>
            {detail ||
              'Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.'}
          </PopoverBody>
        </Popover>
      </div>
    );
  }
}
