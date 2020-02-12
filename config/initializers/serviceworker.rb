Rails.application.configure do
  config.serviceworker.routes.draw do
    match '/workelbrot_worker.js' => 'workelbrot_worker.js', pack: true
    match '/wasmorkelbrot_worker.js' => 'wasmorkelbrot_worker.js', pack: true
  end
end
