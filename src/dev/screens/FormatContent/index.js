import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import { Container } from 'shards-react';
import { formatsQuill, modulesQuill } from './api';

const htmlText = ({ version, detail }) =>
  `<h5><strong style="color: rgb(0, 102, 204);">Version ${version}</strong></h5><p><span style="color: rgb(187, 187, 187);">2019-08-29</span>  <strong>${detail}</strong></p><p><br></p><p>	Handle completely undecoded input in term (Bug#29918)</p><p><br></p><p>	* lisp/term.el (term-emulate-terminal): Avoid errors if the whole</p><p>	decoded string is eight-bit characters.  Don't attempt to save the</p><p>	string for next iteration in that case.</p><p>	* test/lisp/term-tests.el (term-decode-partial)</p><p>	(term-undecodable-input): New tests.</p><p><br></p><p>2019-06-15  Paul Eggert  &lt;eggert@cs.ucla.edu&gt;</p><p><br></p><p>	Port to platforms where tputs is in libtinfow</p><p><br></p><p>	* configure.ac (tputs_library): Also try tinfow, ncursesw (Bug#33977).</p><p><br></p><p>2019-02-08  Eli Zaretskii  &lt;eliz@gnu.org&gt;</p><p><br></p><p>	Improve documentation of 'date-to-time' and 'parse-time-string'</p><p><br></p><p>	* doc/lispref/os.texi (Time Parsing): Document</p><p>	'parse-time-string', and refer to it for the description of</p><p>	the argument of 'date-to-time'.</p><p><br></p><p>	* lisp/calendar/time-date.el (date-to-time): Refer in the doc</p><p>	string to 'parse-time-string' for more information about the</p><p>	format of the DATE argument.  (Bug#34303)</p><p><br></p>`;

export default () => {
  const [content, setContent] = useState('');
  const _onChange = val => {
    //  showLog({ val });
    setContent(val);
  };
  return (
    <Container fluid className="main-content-container p-3">
      <div
        dangerouslySetInnerHTML={{
          __html: `${content}`
        }}
      />
      <ReactQuill
        modules={modulesQuill}
        formats={formatsQuill}
        onChange={_onChange}
        value={content || ''}
        className="add-new-post__editor mb-1"
      />
    </Container>
  );
};
