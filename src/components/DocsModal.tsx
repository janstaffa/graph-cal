import { MdClose } from 'react-icons/md';
import { Modal } from 'react-tiny-modals';
export interface DocsModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DocsModal: React.FC<DocsModalProps> = ({ isOpen, setIsOpen }) => {
  return (
    <Modal isOpen={isOpen} onClickOutside={() => setIsOpen(false)}>
      <div className="modal-close" onClick={() => setIsOpen(false)}>
        <MdClose />
      </div>
      <div className="modal">
        <div className="modal-content">
          <h2>Graphing calculator</h2>
          by{' '}
          <a href="http://janstaffa.cz" target="_blank">
            janstaffa
          </a>
          <hr />
          <ul>
            <li>Syntax:</li>
            <p>
              You can use standard math syntax for function equations. The only
              available variable is 'x', which will be automatically filled in
              by the calculator (example:
              <code>f(x) = x-5</code>).
            </p>
            <li>Features:</li>
            <p>
              Movement. You can move around the graph by dragging your mouse. To
              zoom in and out use your scroll wheel or buttons on the right.
            </p>
            <p>
              You can create new functions by clicking the '+' button under the
              function list (you can only create a new function when all current
              current functions are filled in).
            </p>
            <p>
              To temporarily hide a function from the graph click on it's color
              indicator on the right of the function input.
            </p>
            <p>
              To remove a function from the graph click on the trash icon next
              to the function input.
            </p>
            <p>
              To change the function interval click on the arrow inside the
              function input. This expands another input for changing the
              interval. Accepted intervals are: R(Real numbers), Z(Integers),
              N(Natural numbers), W(Whole numbers), or standard math syntax
              (example:
              <code>x∈ &lt;2; Infinity)</code> =&gt; from 2(inclusive) to +
              infinity).
            </p>
            <p>
              Right tool bar. The top most button enables value picker mode -
              displays exact y value of every function at current mouse
              position. Home button returns you to 0,0 coordinates and resets
              any zoom. The zoom and unzoom buttons are self explanatory.
            </p>
            <p>
              Detail slider. This slider changes the ammount of points in
              <b>one</b> square of the grid for each graph. The higher the
              number, the better quality but lower performance.
            </p>
            <li>Functions in functions:</li>
            <p>Available functions:</p>
            <table className="table">
              <thead>
                <tr>
                  <td>name</td>
                  <td>description</td>
                  <td>arguments</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>sin</td>
                  <td>gets the sine value of it's argument</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>cos</td>
                  <td>gets the cosine value of it's argument</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>tan</td>
                  <td>gets the tangens value of it's argument</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>sqrt</td>
                  <td>gets the square root of it's argument</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>root</td>
                  <td>
                    gets the n'th root of it's first argument with n being the
                    second argument
                  </td>
                  <td>2</td>
                </tr>
                <tr>
                  <td>abs</td>
                  <td>gets the absolute value of it's argument</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>max</td>
                  <td>retruns the grater of two arguments</td>
                  <td>2</td>
                </tr>
                <tr>
                  <td>min</td>
                  <td>retruns the smaller of two arguments</td>
                  <td>2</td>
                </tr>
                <tr>
                  <td>mod</td>
                  <td>retruns the modulus of two arguments</td>
                  <td>2</td>
                </tr>
                <tr>
                  <td>fac</td>
                  <td>
                    retruns the factorial of it's argument('!' after the number
                    is also valid)
                  </td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>round</td>
                  <td>retruns the closest number to it's argument</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>int</td>
                  <td>truncates the number(removes all decimal places)</td>
                  <td>1</td>
                </tr>
              </tbody>
            </table>
            <li>Examples:</li>
            <ul>
              <li>
                square wave: <code>mod(abs(int(x)), 2)-1/2</code>
              </li>
              <li>
                puny single diode rectifier: <code>max(0, sin(x))</code>
              </li>
              <li>
                FULL BRIDGE RECTIFIER: <code>abs(sin(x))</code>
              </li>
              <li>
                triangle wave: <code>min(mod(x, 2), abs(mod(-x, 2)))-0.5</code>
              </li>
            </ul>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default DocsModal;
