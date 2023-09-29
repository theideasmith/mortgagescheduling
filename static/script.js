function xyzip(arr1, arr2) {
    return arr1.map((value, index) => ({"x": value, "y":arr2[index]}) );
}

function arrsum(arr) {
    return arr.reduce((acc, curr) => acc + curr, 0);
}
class Mortgage {
    constructor(r, principal, nperiods) {
        this.i = r / 12;
        this.P0 = principal;
        this.N = nperiods;
        this.M = this.yearlyPayment();
    }
    
    yearlyPayment() {
        return (this.P0 * this.i * Math.pow((1 + this.i), this.N)) / (Math.pow((1 + this.i), this.N) - 1);
    }
    
    A(n) {
        return (this.P0 * this.i * Math.pow((1 + this.i), this.N)) / (Math.pow((1 + this.i), this.N) - 1) - this.R(n);
    }
    
    p(n) {
        return this.P0 * Math.pow((1 + this.i), n) - (Math.pow((1 + this.i), n) - 1) / this.i * (this.P0 * this.i * Math.pow((1 + this.i), this.N)) / (Math.pow((1 + this.i), this.N) - 1);
    }
    
    R(n) {
        return this.p(n - 1) * this.i;
    }
    
    PV(n) {
        return this.M / Math.pow((1 + this.i), n);
    }

    data(){
        let pds = Array.from({length: this.N}, (_, n) => n);
        let As = Array.from({length: this.N}, (_, n) => this.A(n + 1));
        let Rs = Array.from({length: this.N}, (_, n) => this.R(n + 1));
        let PVs = Array.from({length: this.N}, (_, n) => this.PV(n + 1));
        let Ms = Array.from({length: this.N}, (_, n) => this.A(n + 1) + mort.R(n + 1));
        return {pds:pds, As: As, Rs:Rs, PVs: PVs, Ms: Ms}
    }
}

class ARMLoan extends Mortgage {
    constructor(principal, nperiods, m, r1, r2) {
        super(r1, principal, nperiods);
        this.morty1 = new Mortgage(r1, principal, nperiods);
        this.morty2 = new Mortgage(r2, this.morty1.p(m), nperiods - m);
    }
}

function paymentsFixedData(){
    let P = parseFloat(document.getElementById('Pstatic').value);
    let r = parseFloat(document.getElementById('rstatic').value);
    let m = parseInt(document.getElementById('mstatic').value);
    let T = parseInt(document.getElementById('Tstatic').value)
    let N = m*T;
    mort = new Mortgage(r, P, N)
    
    let pds = Array.from({length: N}, (_, n) => n);
    let As = Array.from({length: N}, (_, n) => mort.A(n + 1));
    let Rs = Array.from({length: N}, (_, n) => mort.R(n + 1));
    let PVs = Array.from({length: N}, (_, n) => mort.PV(n + 1));
    let Ms = Array.from({length: N}, (_, n) => mort.A(n + 1) + mort.R(n + 1));

    Rs_plot = xyzip(pds, Rs)
    As_plot = xyzip(pds, As)
    Ms_plot = xyzip(pds, Ms)
    return [{
          label:"Interest Payments",
          pointRadius: 4,
          pointBackgroundColor: "rgba(0,0,255,1)",
          borderColor: "rgba(0,0,255,1)",
          data: Rs_plot,
          fill:false
        },
        {
          label:"Amortization Payments",
          pointRadius: 4,
          pointBackgroundColor: "rgba(0,255,0,1)",
          borderColor: "rgba(0,255,0,1)",
          data: As_plot,
          fill:false
        },
        {
          label:"Fixed Rate Payments",
          pointRadius: 4,
          pointBackgroundColor: "rgba(255,0,0,1)",
          borderColor: "rgba(255,0,0,1)",
          data: Ms_plot,
          fill:false
        }]
     

}

function getFixedMort(){
    let r = parseFloat(document.getElementById('rstatic').value);
    let m = parseInt(document.getElementById('mstatic').value);
    let T = parseInt(document.getElementById('Tstatic').value)
    let P = parseInt(document.getElementById('Pstatic').value);
    let N = m*T;
    mort = new Mortgage(r, P, N)
    return mort;
}
function displayPaymentScheduleFixed(){

    P = parseFloat(document.getElementById("fixedLoanRange").value);
    let r = parseFloat(document.getElementById('rstatic').value);
    let m = parseInt(document.getElementById('mstatic').value);
    let T = parseInt(document.getElementById('Tstatic').value)
    let N = m*T;
    mort = new Mortgage(r, P, N)

    let pds = Array.from({length: mort.N}, (_, n) => n);
    let As = Array.from({length: mort.N}, (_, n) => mort.A(n + 1));
    let Rs = Array.from({length:mort.N}, (_, n) => mort.R(n + 1));
    let PVs = Array.from({length: mort.N}, (_, n) => mort.PV(n + 1));
    let Ms = Array.from({length: mort.N}, (_, n) => mort.A(n + 1) + mort.R(n + 1));

    Rs_plot = xyzip(pds, Rs)
    As_plot = xyzip(pds, As)
    Ms_plot = xyzip(pds, Ms)
    new Chart("interestPerPaymentRecasting", {
        type: "scatter",
        data: {
            datasets: [{
                label: "Recast Interest Payments",
                pointRadius: 4,
                pointBackgroundColor: "rgba(0,255,255,1)", // Cyan
                borderColor: "rgba(0,255,255,1)", // Cyan
                data: Rs_plot,
                fill: false
            },
            {
                label: "Recast Amortization Payments",
                pointRadius: 4,
                pointBackgroundColor: "rgba(255,0,255,1)", // Magenta
                borderColor: "rgba(255,0,255,1)", // Magenta
                data: As_plot,
                fill: false
            },
            {
                label: "Recast Fixed Rate Payments",
                pointRadius: 4,
                pointBackgroundColor: "rgba(255,255,0,1)", // Yellow
                borderColor: "rgba(255,255,0,1)", // Yellow
                data: Ms_plot,
                fill: false
            }].concat(paymentsFixedData())
        }
    });
}

function paymentWasCalculated() {
    mort = getFixedMort();
    document.getElementById('monthlyPayment').innerText = mort.M.toFixed(2);
    document.getElementById("fixedLoanRange").max = mort.P0;
    displayPaymentScheduleFixed();
}


function calculatePaymentsFixedWithP(P) {
    let r = parseFloat(document.getElementById('rstatic').value);
    let m = parseInt(document.getElementById('mstatic').value);
    let T = parseInt(document.getElementById('Tstatic').value)
    let N = m*T;
    mort = new Mortgage(r, P, N)
    
    document.getElementById('monthlyPayment').innerText = mort.M.toFixed(2);

    let pds = Array.from({length: N}, (_, n) => n);
    let As = Array.from({length: N}, (_, n) => mort.A(n + 1));
    let Rs = Array.from({length: N}, (_, n) => mort.R(n + 1));
    let PVs = Array.from({length: N}, (_, n) => mort.PV(n + 1));
    let Ms = Array.from({length: N}, (_, n) => mort.A(n + 1) + mort.R(n + 1));

    Rs_plot = xyzip(pds, Rs)
    As_plot = xyzip(pds, As)
    Ms_plot = xyzip(pds, Ms)
    new Chart("interestPerPaymentRecasting", {
        type: "scatter",
        data: {
            datasets: [{
                label: "Recast Interest Payments",
                pointRadius: 4,
                pointBackgroundColor: "rgba(0,255,255,1)", // Cyan
                borderColor: "rgba(0,255,255,1)", // Cyan
                data: Rs_plot,
                fill: false
            },
            {
                label: "Recast Amortization Payments",
                pointRadius: 4,
                pointBackgroundColor: "rgba(255,0,255,1)", // Magenta
                borderColor: "rgba(255,0,255,1)", // Magenta
                data: As_plot,
                fill: false
            },
            {
                label: "Recast Fixed Rate Payments",
                pointRadius: 4,
                pointBackgroundColor: "rgba(255,255,0,1)", // Yellow
                borderColor: "rgba(255,255,0,1)", // Yellow
                data: Ms_plot,
                fill: false
            }].concat(paymentsFixedData())
        }
    });
}

function calculatePaymentsARM() {
    let P = parseFloat(document.getElementById('Parm').value);
    let r1 = parseFloat(document.getElementById('r1arm').value);
    let r2 = parseFloat(document.getElementById('r2arm').value);
    let m = parseInt(document.getElementById('marm').value);
    let N = parseInt(document.getElementById('Narm').value)
    army = new ARMLoan(P,  N, m, r1, r2)
    
    document.getElementById('monthlyARMPaymentC1').innerText = army.morty1.M.toFixed(2);
    document.getElementById('monthlyARMPaymentC2').innerText = army.morty2.M.toFixed(2);

    let As1 = Array.from({length: m}, (_, n) => army.morty1.A(n + 1));
    let Rs1 = Array.from({length: m}, (_, n) => army.morty1.R(n + 1));
    let PVs1 = Array.from({length: m}, (_, n) => army.morty1.PV(n + 1));
    let Ms1 = Array.from({length: m}, (_, n) => army.morty1.A(n + 1) + army.morty1.R(n + 1));

    let As2 = Array.from({length: N - m}, (_, n) => army.morty2.A(n + 1));
    let Rs2 = Array.from({length: N - m}, (_, n) => army.morty2.R(n + 1));
    let PVs2 = Array.from({length: N - m}, (_, n) => army.morty2.PV(n + 1));
    let Ms2 = Array.from({length: N - m}, (_, n) => army.morty2.A(n + 1) + army.morty2.R(n + 1));

    let As = [...As1, ...As2];
    let Rs = [...Rs1, ...Rs2];
    let PVs = [...PVs1, ...PVs2];
    let Ms = [...Ms1, ...Ms2];
    let pds = Array.from({length: N}, (_, n) => n);

    document.getElementById('totalARMRn').innerText = Rs.reduce((partialSum, a) => partialSum + a, 0).toFixed(2)
    Rs_plot = xyzip(pds, Rs)
    As_plot = xyzip(pds, As)
    Ms_plot = xyzip(pds, Ms)
    console.log(pds)
    new Chart("interestPerPaymentARM", {
      type: "scatter",
      data: {
        datasets: [{
          label:"Interest Payments",
          pointRadius: 4,
          pointBackgroundColor: "rgba(0,0,255,1)",
          borderColor: "rgba(0,0,255,1)",
          data: Rs_plot,
          fill:false
        },
        {
          label:"Amortization Payments",
          pointRadius: 4,
          pointBackgroundColor: "rgba(0,255,0,1)",
          borderColor: "rgba(0,255,0,1)",
          data: As_plot,
          fill:false
        },
        {
          label:"Fixed Rate Payments",
          pointRadius: 4,
          pointBackgroundColor: "rgba(255,0,0,1)",
          borderColor: "rgba(255,0,0,1)",
          data: Ms_plot,
          fill:false
        }]
      }
    });
    // document.getElementById("armLoanRange").max = P;
    // document.getElementById('interestPerPayment').innerText = mort.R(1).toFixed(2);
    // document.getElementById('principalPerPayment').innerText = mort.A(1).toFixed(2);
}

const slider = document.getElementById("fixedLoanRange");
const output = document.getElementById("fixedLoanRecasting");

slider.oninput = function() {
    output.textContent = this.value;
    calculatePaymentsFixedWithP(parseFloat(document.getElementById('Pstatic').value)-parseFloat(this.value));
    let P = parseFloat(document.getElementById('Pstatic').value);

    document.getElementById('fixedLoanTotalPrincipal').innerText = document.getElementById('Pstatic').value

    let r = parseFloat(document.getElementById('rstatic').value);
    let m = parseInt(document.getElementById('mstatic').value);
    let T = parseInt(document.getElementById('Tstatic').value)
    let N = m*T;
    mort = new Mortgage(r, P, N)
    recastmort = new Mortgage(r, document.getElementById('Pstatic').value-parseFloat(this.value), N)
    console.log(arrsum(recastmort.data().Rs)+arrsum(recastmort.data().As)+parseFloat(this.value))

    document.getElementById('fixedLoanTotalPayment').innerText = (arrsum(mort.data().Rs) + arrsum(mort.data().As)).toFixed(2)
    document.getElementById('fixedLoanTotalPaymentRecast').innerText = ((arrsum(recastmort.data().Rs) + arrsum(recastmort.data().As)) + parseFloat(this.value)).toFixed(2)
}

document.addEventListener("DOMContentLoaded", function(event) {
      /* 
        - Code to execute when only the HTML document is loaded.
        - This doesn't wait for stylesheets, 
          images, and subframes to finish loading. 
      */
    mort = getFixedMort();
    console.log(mort)
    document.getElementById('fixedLoanRange').value = 0;
    document.getElementById('fixedLoanRange').max = mort.P0;
    console.log("MORT")
    console.log(mort.P0)
    paymentWasCalculated()
    calculatePaymentsARM()
  });