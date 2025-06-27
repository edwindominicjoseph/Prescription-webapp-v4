import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';

export default function MedicationChart({ data, onSelect }) {
  const options = {
    plugins: { legend: { display: false } },
    cutout: '60%',
    onClick: (_evt, elements) => {
      if (!elements.length) return;
      const idx = elements[0].index;
      onSelect(data.labels[idx]);
    },
  };

  return (
    <div className="md:flex md:items-start">
      <div className="md:w-1/2 mx-auto">
        <Doughnut data={data} options={options} />
      </div>
      <ul className="md:w-1/2 space-y-2 mt-4 md:mt-0 md:pl-6 text-sm">
        {data.labels.map((label, idx) => (
          <li key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ backgroundColor: data.datasets[0].backgroundColor[idx] }}
              ></span>
              <button
                type="button"
                onClick={() => onSelect(label)}
                className="hover:underline text-left"
              >
                {label}
              </button>
            </div>
            <span className="text-gray-400">
              {data.datasets[0].data[idx]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

MedicationChart.propTypes = {
  data: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
};

MedicationChart.defaultProps = {
  onSelect: () => {},
};
